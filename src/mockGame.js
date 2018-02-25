import io from 'socket.io-client';
import { config } from '../package.json';

const socket1 = io('http://localhost:' + config.serverSocketPort);
socket1.on('connect', () => {
  socket1.emit('submitName', 'Bob');
});

socket1.on('playerJoined', msg => {
  console.log(msg);
  socket1.close();
});

const socket2 = io('http://localhost:' + config.serverSocketPort);
socket2.on('connect', () => {
  socket2.emit('submitName', 'Tom');
});

socket2.on('playerJoined', msg => {
  console.log(msg);
});

socket2.on('playerExit', msg => {
  console.log(msg);
});
