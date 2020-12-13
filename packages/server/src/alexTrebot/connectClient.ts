import yaml from "yaml";
import fs from "fs";
import { ChatUserstate, Client } from "tmi.js";
import config from "../config";
import makeHandler from "./handler";

export const getText = (): Promise<Record<string, Array<string>>> =>
  new Promise((resolve, reject) => {
    fs.readFile("./text.yaml", "utf8", (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(yaml.parse(data));
    });
  });

export const connectClient = async (): Promise<Client> => {
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
  const text = await getText();
  const handler = await makeHandler(client, text);
  client.on("connected", (addr, port) => {
    console.info(`* Connected to ${addr}:${port}`);
  });
  client.on(
    "message",
    (
      target: string,
      context: ChatUserstate,
      message: string,
      isSelf: boolean
    ) => handler(target, context, message, isSelf)
  );
  client.connect();
  console.info("alextrebot is connected");
  return client;
};

export default connectClient;
