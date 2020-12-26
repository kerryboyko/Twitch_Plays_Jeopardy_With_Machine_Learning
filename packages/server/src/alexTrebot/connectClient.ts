import yaml from "yaml";
import fs from "fs";
import { ChatUserstate, Client } from "tmi.js";
import config from "../config";
import makeHandler from "./handler";
import { Server } from "socket.io";
import { wsServer } from "../sockets/commands";

export const getText = (): Promise<Record<string, Array<string>>> =>
  new Promise((resolve, reject) => {
    fs.readFile("./text.yaml", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(yaml.parse(data));
    });
  });

export const connectClient = async (io: Server): Promise<Client> => {
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
  const handler = await makeHandler(io, client, text);
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
    ) => {
      io.emit(
        wsServer.CHAT_LOG,
        JSON.stringify({ message, user: context["display-name"] })
      );
      handler(target, context, message, isSelf);
    }
  );
  client.connect();
  console.info("alextrebot is connected");
  return client;
};

export default connectClient;
