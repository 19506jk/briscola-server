import socketIO from 'socket.io';
import _ from 'lodash';
import Game from './game';

export default class IOModule {
  constructor(port) {
    this.io = socketIO(port);
    this.game = new Game();
    this.sockets = Array(5).fill(null);
  }

  resetGame() {
    this.game = new Game();
  }

  _distributeCards() {
    for (let i = 0; i < 5; i += 1) {
      const hand = this.game.getCards(i);
      this.sockets[i].emit('setCards', hand);
    }
  }

  launch() {
    const { io } = this;

    io.on('connection', (socket) => {
      let index;
      let playerName;

      socket.on('submitName', (name) => {
        index = this.game.addPlayer(name);
        playerName = name;
        this.sockets[index] = socket;
        io.emit('playerJoined', `${name} has joined the game`);
      });

      socket.on('disconnect', () => {
        if (index) {
          this.game.removePlayer(index);
        }

        if (_.isNil(playerName)) {
          playerName = 'A player';
        }
        io.emit('playerExit', `${playerName} has left the game`);
      });

      socket.on('readyStatus', (ready) => {
        this.game.setReadyStatus(index, ready);
        io.emit('playerReadyStatus', { playerName, ready });
        if (this.game.playersReady()) {
          this._distributeCards();
        }
      });

      socket.on('bid', (bid) => {
        if (bid.passed) {
          io.emit('playerPassedBid', { player: playerName });
        } else {
          io.emit('playerBid', { player: playerName, bid: bid.points });
        }

        this.game.submitBid(bid, index);
        const caller = this.game.getCaller();
        if (caller) {
          io.emit('setCaller', { name: caller.name, index: caller.index, bid: this.game.getBid() });
        }
      });

      socket.on('setCalledCard', (card) => {
        this.game.setCalledCard(index, card);
        io.emit('gameStarts', { player: this.game.getNextPlayer() });
      });

      socket.on('playCard', (card) => {
        this.game.playCard(_.merge(card, { playerIndex: index, playerName }));
        const nextPlayer = this.game.getNextPlayer();

        if (nextPlayer === -1) {
          const winner = this.game.getRoundResult();
          const scores = this.game.getScores();
          io.emit('roundResult', { winner, scores });

          if (this.game.isGameOver()) {
            io.emit('finalResult', this.game.getFinalResult());
          }
        } else {
          io.emit('nextPlayer', nextPlayer);
        }
      });
    });
  }
}
