import { createServer } from "http";
import cors from "cors";
import express from "express";
import { Server as SocketServer } from "socket.io";
import config from "./config";
import router from "./router";
import getAccessToken from "./getAccessToken";
import sockets from "./sockets";
import alexTrebot from "./alexTrebot";
// export the websocket commands -- these will also be used by the client.

const PORT = parseInt(config.SERVER_PORT, 10);
const main = async () => {
  console.info("Launching @jeopardai/server");
  const app = express();
  const http = createServer(app);
  app.use(cors());
  const apiToken: string = await getAccessToken();
  router(app, apiToken);
  const io: SocketServer = sockets(http);
  alexTrebot(io);
  http.listen(PORT, () => {
    console.info(`JeopardAI REST app listening at http://localhost:${PORT}`);
  });
};

main();
