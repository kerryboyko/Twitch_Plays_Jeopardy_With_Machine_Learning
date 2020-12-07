import WebSocket from "ws";
import config from "../config";

const startWebsocketServer = (port: number) => {
  const wss = new WebSocket.Server({ port });
  wss.on("connection", (ws, request, client) => {
    ws.on("message", (message) => {
      console.info(`websocket recieved ${message}`);
      ws.send(`message recieved: ${message} from client ${client}`);
      ws.emit("MESSAGE_RECIEVED", message, new Date().toISOString());
    });

    ws.send(`Connected to websocket server`);
  });
};

export default startWebsocketServer;
