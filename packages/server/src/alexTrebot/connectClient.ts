import { ChatUserstate, Client } from "tmi.js";
import config from "../config";
import handlers from "./handlers";

export const connectClient = (): Client => {
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
  const { handleChat, handleWhisper } = handlers(client);
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
      if (isSelf) {
        console.log(context, message);
        return;
      }
      if (context["message-type"] === "chat") {
        handleChat(target, context, message);
      }
      if (context["message-type"] === "whisper") {
        handleWhisper(target, context, message);
      }
    }
  );
  client.connect();
  return client;
};

export default connectClient;
