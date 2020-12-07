import WebSocket from 'ws';
import config from '../config';

const startWebsocketServer = (port = config.WEBSOCKET_SERVER_PORT) => {
  const wss = new WebsocketServer({ port });
  wss.on('connection', (ws, request, client) => {
    ws.on('message', (message) => {
      console.info(`websocket recieved ${message}`);
      ws.send(`message recieved: ${message} from client ${client  @}`);
      ws.emit('MESSAGE_RECIEVED', message, new Date().toISOString());
    });

    ws.send(`Connected to websocket server`);
  });
};
