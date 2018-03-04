import { assert } from 'chai';
import io from 'socket.io-client';
import IOModule from '../src/IOModule';

const port = 7777;
const socketURL = `http://localhost:${port}`;

describe('IOModule', () => {
  let subject;
  let player1;
  let player2;
  let player3;
  let player4;
  let player5;

  before(() => {
    subject = new IOModule(port);
    subject.launch();
  });

  beforeEach((done) => {
    player1 = io.connect(socketURL, { forceNew: true });
    player2 = io.connect(socketURL, { forceNew: true });
    player3 = io.connect(socketURL, { forceNew: true });
    player4 = io.connect(socketURL, { forceNew: true });
    player5 = io.connect(socketURL, { forceNew: true });
    done();
  });

  afterEach((done) => {
    player1.disconnect();
    player2.disconnect();
    player3.disconnect();
    player4.disconnect();
    player5.disconnect();
    subject.resetGame();
    done();
  });

  describe('on socket submitName', () => {
    it('should broadcast the name of new player', (done) => {
      player1.on('connect', () => {
        player1.emit('submitName', 'Foo');
      });

      player2.on('connect', () => {
        player2.on('playerJoined', (data) => {
          assert.equal(data, 'Foo has joined the game');
          done();
        });
      });
    });
  });

  describe('on socket disconnect', () => {
    it('should broadcast the name of player that left', (done) => {
      player2.on('connect', () => {
        player2.on('playerExit', (data) => {
          assert.equal(data, 'Foo has left the game');
          done();
        });
      });

      player1.on('connect', () => {
        player1.emit('submitName', 'Foo');
        player1.disconnect();
      });
    });

    it('should broadcast the player that left who does not have name set', (done) => {
      player3.on('connect', () => {
        player3.on('playerExit', (data) => {
          assert.equal(data, 'A player has left the game');
          done();
        });
      });

      player2.on('connect', () => {
        player2.disconnect();
      });
    });
  });

  describe('on readyStatus', () => {
    it('should broadcast player who is ready', (done) => {
      player1.on('connect', () => {
        player1.emit('submitName', 'Foo');
        player1.emit('readyStatus', true);
      });

      player2.on('connect', () => {
        player2.on('playerReadyStatus', (data) => {
          assert.deepEqual(data, {
            playerName: 'Foo',
            ready: true,
          });
          done();
        });
      });
    });

    it('should distribute cards to each player when everyone is ready', (done) => {
      player1.on('connect', () => {
        player1.emit('submitName', 'Player1');
        player1.emit('readyStatus', true);
        player1.on('setCards', (data) => {
          assert.equal(data.length, 8, 'player should receive 8 cards');
          done();
        });
      });

      player2.on('connect', () => {
        player2.emit('submitName', 'Player2');
        player2.emit('readyStatus', true);
      });

      player3.on('connect', () => {
        player3.emit('submitName', 'Player3');
        player3.emit('readyStatus', true);
      });

      player4.on('connect', () => {
        player4.emit('submitName', 'Player4');
        player4.emit('readyStatus', true);
      });

      player5.on('connect', () => {
        player5.emit('submitName', 'Player5');
        player5.emit('readyStatus', true);
      });
    });
  });

  describe('on bid', () => {
    it('should broadcast message when player passes bid', (done) => {
      player1.on('connect', () => {
        player1.on('playerPassedBid', (data) => {
          assert.deepEqual(data, { player: 'Player2' });
          done();
        });
      });
      player2.on('connect', () => {
        player2.emit('submitName', 'Player2');
        player2.emit('bid', { passed: true });
      });
    });

    it('should broadcast message when player submits a bid', (done) => {
      player1.on('connect', () => {
        player1.on('playerBid', (data) => {
          assert.deepEqual(data, { player: 'Player2', bid: 10 });
          done();
        });
      });
      player2.on('connect', () => {
        player2.emit('submitName', 'Player2');
        player2.emit('bid', { passed: false, points: 10 });
      });
    });

    it('should broadcast the caller when four players passed the bid', (done) => {
      player1.on('connect', () => {
        player1.on('setCaller', (data) => {
          assert.equal(data.name, 'Player2', 'Player 2 is the caller');
          assert.equal(data.bid, 10, 'Bid is 10 points');
          done();
        });
        player1.emit('submitName', 'Player1');
        player1.emit('bid', { passed: true });
      });
      player2.on('connect', () => {
        player2.emit('submitName', 'Player2');
        player2.emit('bid', { passed: false, points: 10 });
      });
      player3.on('connect', () => {
        player3.emit('submitName', 'Player3');
        player3.emit('bid', { passed: true });
      });
      player4.on('connect', () => {
        player4.emit('submitName', 'Player4');
        player4.emit('bid', { passed: true });
      });
      player5.on('connect', () => {
        player5.emit('submitName', 'Player5');
        player5.emit('bid', { passed: true });
      });
    });
  });

  describe('on setCallerCard', () => {
    it('should set caller card and notify players the start of the game', (done) => {
      player2.on('connect', () => {
        player2.on('gameStarts', (data) => {
          assert.deepEqual(data, { player: 0 });
          done();
        });
      });
      player1.on('connect', () => {
        player1.emit('setCalledCard', { suit: 'Feather', rank: { name: 'Two' } });
      });
    });
  });

  describe('on playCard', () => {
    it('should broadcast the next player to play card', (done) => {
      player1.on('connect', () => {
        player1.on('nextPlayer', (data) => {
          assert.equal(data, 1, 'Player at index 1 plays card next');
          done();
        });
        player1.emit('setCalledCard', { suit: 'Feather', rank: { name: 'Two' } });
        player1.emit('playCard', { suit: 'Feather', rank: { name: 'Two' } });
      });
    });

    it('should broadcast result of the round when all players have played a card', (done) => {
      player1.on('connect', () => {
        player1.on('roundResult', (data) => {
          assert.deepEqual(data, {
            winner: {
              playerName: 'Player5',
              playerIndex: 4,
              suit: 'A',
              rank: {
                point: 5,
                value: 11,
              },
            },
            scores: [0, 0, 0, 0, 15],
          });
          done();
        });
        player1.emit('submitName', 'Player1');
        player1.emit('setCalledCard', { name: 'Ace', suit: 'A' });
        player1.emit('playCard', { suit: 'A', rank: { point: 1, value: 1, }, });
      });
      player2.on('connect', () => {
        player2.emit('submitName', 'Player2');
        player2.emit('playCard', { suit: 'C', rank: { point: 2, value: 5 }, });
      });
      player3.on('connect', () => {
        player3.emit('submitName', 'Player3');
        player3.emit('playCard', { suit: 'C', rank: { point: 3, value: 7 }, });
      });
      player4.on('connect', () => {
        player4.emit('submitName', 'Player4');
        player4.emit('playCard', { suit: 'A', rank: { point: 4, value: 10 }, });
      });
      player5.on('connect', () => {
        player5.emit('submitName', 'Player5');
        player5.emit('playCard', { suit: 'A', rank: { point: 5, value: 11, }, });
      });
    });

    it('should return correct final result', (done) => {
      subject.game.roundCount = 5;

      player1.on('connect', () => {
        // Guilty player
        const card = { suit: 'A', rank: { point: 1, value: 1, name: 'A' }};
        player1.on('finalResult', (data) => {
          assert.deepEqual(data, {
            guiltyPoints: 0,
            nonGuiltyPoints: 15,
            bid: 10,
          })
          done();
        });
        subject.game.players[0].cards = [card];
        player1.emit('submitName', 'Player1');
        player1.emit('playCard', card);
        player3.emit('bid', { passed: true });
      });
      player2.on('connect', () => {
        // Caller
        const card = { suit: 'C', rank: { point: 2, value: 5, name: 'B' }};
        subject.game.players[1].cards = [card];
        player2.emit('submitName', 'Player2');
        player2.emit('bid', { passed: false, points: 10 });
        player2.emit('setCalledCard', { name: 'A', suit: 'A' });
        player2.emit('playCard', card);
      });
      player3.on('connect', () => {
        const card = { suit: 'C', rank: { point: 3, value: 7, name: 'C' }};
        subject.game.players[2].cards = [card];
        player3.emit('submitName', 'Player3');
        player3.emit('playCard', card);
        player3.emit('bid', { passed: true });
      });
      player4.on('connect', () => {
        const card = { suit: 'A', rank: { point: 4, value: 10, name: 'Z' }};
        subject.game.players[3].cards = [card];
        player4.emit('submitName', 'Player4');
        player4.emit('playCard', card);
        player4.emit('bid', { passed: true });
      });
      player5.on('connect', () => {
        const card = { suit: 'A', rank: { point: 5, value: 11, name: 'D' }};
        subject.game.players[4].cards = [card];
        player5.emit('submitName', 'Player5');
        player5.emit('playCard', card);
        player5.emit('bid', { passed: true });
      });
    });
  });
});
