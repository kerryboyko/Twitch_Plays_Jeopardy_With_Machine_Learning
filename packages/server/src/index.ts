import config from "./config";
import startRestServer from "./restServer";
import startWebsocketServer from "./websocketServer";

const main = () => {
  startRestServer(parseInt(config.REST_SERVER_PORT, 10));
  startWebsocketServer(parseInt(config.WEBSOCKET_SERVER_PORT, 10));
};

main();
