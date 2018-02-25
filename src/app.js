import Express from 'express';
import IOModule from './IOModule';
import { config } from '../package.json';

const app = Express();
const socketIO = new IOModule();

// eslint-disable-next-line no-console
const server = app.listen(config.serverPort, () => console.log('server listening on port 8080'));

app.get('/', (req, res) => {
  res.send('Briscola server is running!');
});

socketIO.launch();
