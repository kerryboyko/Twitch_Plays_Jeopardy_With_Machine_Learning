import WebSocket from 'ws';
import config from '../config';

const startWebsocketServer = (port = config.WEBSOCKET_SERVER_PORT) => {
  const wss = new WebsocketServer({ port });
  wss.on('connection', (client) => {
    client.on('message', (message) => {
      console.log(`recieved ${message}`);
      client.send(`message recieved: ${message}`);
      client.emit('MESSAGE_RECIEVED', message, new Date().toISOString());
    });

    client.send(`Connected to websocket server`);
  });
};
