import { assert } from 'console';
import dotenv from 'dotenv';
import pick from 'lodash/pick';
dotenv.config();

assert(process.env.CANARY === 'true');

const config: Record<string, string> = pick(process.env, [
  'DB_URL',
  'DB_NAME',
  'JSERVICE_URL',
  'BOT_USERNAME',
  'CHANNEL_NAME',
  'OAUTH_TOKEN',
  'REST_SERVER_PORT',
  'WEBSOCKET_SERVER_PORT',
]) as Record<string, string>;

export default config;
