import { createServer } from "http";
import cors from "cors";
import express from "express";
import { Server as SocketServer } from "socket.io";
import config from "./config";
// import router from "./router";
import sockets from "./sockets";
import alexTrebot from "./alexTrebot";
// export the websocket commands -- these will also be used by the client.

const PORT = parseInt(config.SERVER_PORT, 10);
const main = () => {
  console.info("Launching @jeopardai/server");
  const app = express();
  const http = createServer(app);
  // router(app);
  const io: SocketServer = sockets(http);
  alexTrebot(io);
  app.use(cors());
  http.listen(PORT, () => {
    console.info(`JeopardAI REST app listening at http://localhost:${PORT}`);
  });
};

main();
