import ioLib from 'socket.io';
import Game from './game';

const PORT = 7777;

export default class IOModule {
  constructor() {
    this.io = ioLib(PORT);
  }

  launch() {
    const { io } = this;
    const newGame = new Game();

    io.on('connection', (socket) => {
      socket.emit('playerJoined', 'A new player has joined the game');
      newGame.addPlayer();
    });
  }
}
