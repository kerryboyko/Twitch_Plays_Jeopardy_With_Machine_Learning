import express from "express";
import config from "../config";
import router from "./router";

const startRestServer = (port: number) => {
  const app = express();
  router(app);
  app.listen(port, () => {
    console.info(`JeopardAI REST app listening at http://localhost:${port}`);
  });
};

export default startRestServer;
