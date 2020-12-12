import { Client, ChatUserstate } from "tmi.js";
import { ChatHandler } from "../types";

export const handleChat = (client: Client): ChatHandler => (
  target: string,
  context: ChatUserstate,
  message: string
): void => {
  const playerName = context["display-name"];
  console.log({ playerName, message });
  client.say(target, "Got it, thank you");
};

export const handleWhisper = (client: Client): ChatHandler => (
  _target: string,
  context: ChatUserstate,
  message: string
): void => {
  const playerName = context["display-name"];
  console.log({ whisper: true, playerName, message });
  client.whisper(playerName || "unknown", "recieved");
};

export const handlers = (client: Client): Record<string, ChatHandler> => ({
  handleChat: handleChat(client),
  handleWhisper: handleWhisper(client),
});

export default handlers;
