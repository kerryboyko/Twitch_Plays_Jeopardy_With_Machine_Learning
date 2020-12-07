import { ChatUserstate, Client } from 'tmi.js';
import config from '../config';

export const connectClient = () => {
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
    console.info(`* Connected to ${addr}:${port}`);
  });
  client.on('message', (target, context: ChatUserstate, message: string, isSelf: boolean) => {
    if (isSelf) {
      return;
    }
    console.info(`${context['display-name']}: ${message}`);

    if (['!whois', '!whatis', '!whenis', '!whereis'].some((key: string) => message.startsWith(key))) {
      client.say(target, `What is: ${message}`);
    }
  });
  client.connect();
  return client;
};

export default connectClient;
