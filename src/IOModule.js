import socketIO from 'socket.io';
import Game from './game';
import { config } from '../package.json';

export default class IOModule {
  constructor() {
    this.io = socketIO(config.serverSocketPort);
    this.sockets = {};
  }

  launch() {
    const { io } = this;
    const game = new Game();

    io.on('connection', (socket) => {
      socket.on('submitName', (name) => {
        game.addPlayer(name, socket.id);
        this.sockets[socket.id] = { socket, name };
        io.emit('playerJoined', `${name} has joined the game`);
      });

      socket.on('disconnect', () => {
        game.removePlayer(socket.id);
        io.emit('playerExit', `${this.sockets[socket.id].name} has left the game`);
        delete this.sockets[socket.id];
      });
    });
  }
}
