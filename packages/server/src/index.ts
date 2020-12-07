import config from "./config";
import express from "express";
import router from "./router";
import sockets from "./sockets";
import { createServer } from "http";
import cors from 'cors';

const PORT = parseInt(config.SERVER_PORT, 10);
const main = () => {
  console.info("Launching @jeopardai/server");
  const app = express();
  const http = createServer(app);
  router(app);
  sockets(http);
  app.use(cors());
  http.listen(PORT, () => {
    console.info(`JeopardAI REST app listening at http://localhost:${PORT}`);
  });
};

main();
