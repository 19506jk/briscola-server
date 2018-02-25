import Express from 'express';
import IOModule from './IOModule';

const app = Express();
const socketIO = new IOModule();

app.get('/', (req, res) => {
  res.send('Briscola server is running!');
});

// eslint-disable-next-line no-console
app.listen(8080, () => console.log('Server listening on port 8080'));
socketIO.launch();
