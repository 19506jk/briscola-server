import { assert } from 'chai';
import io from 'socket.io-client';
import IOModule from '../src/IOModule';

const port = 7777;
const socketURL = `http://localhost:7777${port}`;

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

  beforeEach(() => {
    player1 = io.connect(socketURL, { forceNew: true });
    player2 = io.connect(socketURL, { forceNew: true });
    player3 = io.connect(socketURL, { forceNew: true });
    player4 = io.connect(socketURL, { forceNew: true });
    player5 = io.connect(socketURL, { forceNew: true });
  });

  afterEach(() => {
    player1.disconnect();
    player2.disconnect();
    player3.disconnect();
    player4.disconnect();
    player5.disconnect();
  });

  describe('on socket submitName', () => {
    it('should broadcast the name of new player', () => {
      player1.on('connect', () => {
        player1.emit('submitName', 'Foo');
      });

      player2.on('connect', () => {
        player2.on('playerJoined', (data) => {
          assert.equal(data, 'Foo has joined the game');
        });
      });
    });
  });

  describe('on socket disconnect', () => {
    it('should broadcast the name of player that left', () => {
      player1.on('connect', () => {
        player1.emit('submitName', 'Foo');
        player1.disconnect();
      });

      player2.on('playerExit', (data) => {
        assert.equal(data, 'Foo has left the game');
      });
    });
  });
});
