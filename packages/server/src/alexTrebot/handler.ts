import { Server } from "socket.io";
import { Client, ChatUserstate } from "tmi.js";
import { server } from "typescript";
import { ChatHandler } from "../types";
import gameHandlers from "./handlers/gameHandlers";

export const slowSay = (
  client: Client,
  target: string,
  delay: number,
  thingsToSay: Array<string>
): void => {
  let cursor = 0;
  const ticker = setInterval(() => {
    client.say(target, thingsToSay[cursor]);
    cursor += 1;
    if (thingsToSay.length === cursor) {
      clearInterval(ticker);
    }
  }, delay);
};

const staggeredSay = (
  name: string,
  client: Client,
  textToSlowSay: string[],
  cooldownTime: number,
  staggerTime = 2000
): ChatHandler => {
  let last = 0;
  return (target, _context, _message, _isSelf) => {
    if (last + cooldownTime < Date.now()) {
      last = Date.now();
      slowSay(client, target, staggerTime, textToSlowSay);
    } else {
      const cooldown = Math.round((cooldownTime + last - Date.now()) / 1000);
      client.say(target, `${name} cooldown ${cooldown} seconds`);
    }
  };
};

const makeCommands = (
  io: Server,
  client: Client,
  text: Record<string, Array<string>>
): Record<string, ChatHandler> => {
  const gameCommands = gameHandlers(io, client, text);
  return {
    "!help": staggeredSay("!help", client, text.help, 1.5 * 60 * 1000),
    "!ai": staggeredSay("!ai", client, text.ai, 5 * 60 * 1000),
    "!legal": staggeredSay("!legal", client, text.legal, 60 * 1000),
    "!startgame": gameCommands.startGame,
  };
};

export const makeHandler = (
  io: Server,
  client: Client,
  text: Record<string, Array<string>>
): ChatHandler => {
  const commands = makeCommands(io, client, text);
  return (
    target: string,
    context: ChatUserstate,
    message: string,
    isSelf: boolean
  ) => {
    // never reply to self messages
    if (isSelf) {
      return;
    }
    const firstWord = message.split(" ")[0].toLowerCase();
    if (firstWord.charAt(0) === "!") {
      if (!commands[firstWord]) {
        client.say(
          target,
          `${firstWord} is not a recognized command. Try "!help"`
        );
      } else {
        commands[firstWord](target, context, message, isSelf);
      }
    }
  };
};

export default makeHandler;
