import { Client } from 'tmi.js';
import config from '../config';

export const launchClient = () => {
  const client = Client({
    options: { debug: true },
    connection: {
      secure: true,
      reconnect: true,
    },
    channels: [config.CHANNEL_NAME],
    identity: {
      username: config.BOT_USERNAME,
      password: config.OAUTH_TOKEN,
    },
  });

  client.on('connected', (addr, port) => {
    console.log(`* Connected to ${addr}:${port}`);
  });

  client.on('message', (target, context, message, self) => {
    if (self) {
      return;
    }
    console.log(`${context['display-name']}: ${message}`);
    if (message.trim().toLowerCase() === '!whatis') {
      client.say(target, `Answers must be in the form of a question`);
    }
  });

  client.connect();
  return client;
};

export default launchClient;
