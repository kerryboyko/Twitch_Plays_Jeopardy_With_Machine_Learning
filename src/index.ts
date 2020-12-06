import express from 'express';
import config from './config';
import router from './router';

const main = () => {
  const app = express();
  const PORT = config.SERVE_ON_PORT;
  router(app);
  app.listen(PORT, () => {
    console.log(`Jeopardy app listening at http://localhost:${PORT}`);
  });
};

main();
