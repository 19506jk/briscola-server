import Express from 'express';
import IOModule from './IOModule';

const app = Express();
const socketIO = new IOModule();

// eslint-disable-next-line no-console
const server = app.listen(8080, () => console.log('server listening on port 8080'));

app.get('/', (req, res) => {
  res.send('Briscola server is running!');
});

socketIO.launch();

export default function close() {
  // eslint-disable-next-line no-console
  console.log('server is shutting down');
  server.close();
}
