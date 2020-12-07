import config from './config';
import startRestServer from './restServer';

const main = () => {
  startRestServer(config.REST_SERVER_PORT);
};

main();
