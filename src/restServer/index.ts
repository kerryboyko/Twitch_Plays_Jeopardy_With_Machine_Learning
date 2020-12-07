import express from 'express';
import config from '../config';
import router from './router';

const startRestServer = (port: number = config.REST_SERVER_PORT) => {
  const app = express();
  router(app);
  app.listen(port, () => {
    console.log(`JeopardAI REST app listening at http://localhost:${port}`);
  });
};

export default startRestServer;
