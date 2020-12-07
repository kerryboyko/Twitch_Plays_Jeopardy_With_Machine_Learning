import config from "./config";
import express from "express";
import router from "./router";
import sockets from "./sockets";
import { createServer } from "http";

const PORT = parseInt(config.SERVER_PORT, 10);
const main = () => {
  console.info("Launching @jeopardai/server");
  const app = express();
  const http = createServer(app);
  router(app);
  sockets(http);
  http.listen(PORT, () => {
    console.info(`JeopardAI REST app listening at http://localhost:${PORT}`);
  });
};

main();
