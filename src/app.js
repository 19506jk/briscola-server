import Express from 'express';
import IOModule from './IOModule';
import { config } from '../package.json';
import deck from '../assets/deck.json';

const app = Express();
const socketIO = new IOModule(config.serverSocketPort);

// eslint-disable-next-line no-console
app.listen(config.serverPort, () => console.log('server listening on port 8080'));

app.get('/', (req, res) => {
  res.send('Briscola server is running!');
});

app.get('/api/debug/reset', (req, res) => {
  socketIO.resetGame();
  res.send('A new game is starting');
});

app.get('/api/deck', (req, res) => {
  res.json(deck);
});

socketIO.launch();

export default socketIO;
