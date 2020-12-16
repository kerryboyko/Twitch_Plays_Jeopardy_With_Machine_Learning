import { createServer } from "https";
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
  const https = createServer(app);
  app.use(cors());
  const apiToken: string = await getAccessToken();
  router(app, apiToken);
  const io: SocketServer = sockets(https);
  alexTrebot(io);
  https.listen(PORT, () => {
    console.info(`JeopardAI REST app listening at https://localhost:${PORT}`);
  });
};

main();
