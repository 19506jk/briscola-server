import socketIO from 'socket.io';
import Game from './game';
import { config } from '../package.json';

export default class IOModule {
  constructor() {
    this.io = socketIO(config.serverSocketPort);
  }

  launch() {
    const { io } = this;
    const game = new Game();

    io.on('connection', (socket) => {
      let index;
      let playerName;

      socket.on('submitName', (name) => {
        index = game.addPlayer(name, id);
        playerName = name;
        io.emit('playerJoined', `${name} has joined the game`);
      });

      socket.on('disconnect', () => {
        game.removePlayer(index);
        if (_.isNil(playerName)) {
          playerName = 'A player';
        }
        io.emit('playerExit', `${playerName} has left the game`);
      });

      socket.on('readyStatus', (ready) => {
        game.setReadyStatus(index, ready);
        io.emit('playerReadyStatus', { playerName, ready });
        if (game.playersReady()) {
          const hand = game.getCards(index);
          socket.emit('setCards', hand);
        }
      });

      socket.on('bid', (bid) => {
        if (bid.passed) {
          const callerIndex = game.submitBidPass();
          io.emit('playerPassedBid', { player: playerName });

          if (callerIndex > -1) {
            io.emit('setCaller', { player: callerIndex, bid: game.getBid() });
          }
        } else {
          io.emit('playerBid', { player: playerName, bid: bid.points })
        }
      });

      socket.on('setCalledCard', (card) => {
        game.setCalledCard(index, card);
        io.emit('gameStarts', { player: game.getNextPlayer() });
      });

      socket.on('playCard', (card) => {
        game.playCard({ player: index, card });
        const nextPlayer = game.getNextPlayer();

        if (nextPlayer === -1) {
          const winner = game.getRoundResult();
          const scores = game.getScores();
          io.emit('roundResult', { player: winner, scores });

          if (game.isGameOver()) {
            io.emit('finalResult', game.getFinalResult());
          }
        } else {
          io.emit('nextPlayer', nextPlayer);
        }
      });
    });
  }

  close() {
    this.io.close();
  }
}
