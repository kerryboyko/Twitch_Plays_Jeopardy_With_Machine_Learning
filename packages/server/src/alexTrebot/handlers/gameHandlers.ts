/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "tmi.js";
import GameManager from "../../GameManager";
import { wsServer } from "../../sockets/commands";
import { ChatHandler, GameState } from "../../types";

// eslint-disable-next-line @typescript-eslint/ban-types

export const gameHandlers = (
  client: Client,
  _text: Record<string, string[]>
): Record<string, ChatHandler> => {
  let game: GameManager;
  const isLiveGame = (): boolean =>
    game !== undefined && game.gameState !== GameState.FinalScores;

  const staggerSay = (() => {
    const queue: any[] = [];
    setInterval(() => {
      if (queue.length > 0) {
        const [target, message] = queue.shift();
        try {
          client.say(target, message);
        } catch (err) {
          console.error(err);
        }
      }
    }, 2000);
    return (target: string, message: string) => {
      queue.push([target, message]);
    };
  })();

  const emitParser = (target: string) => {
    const wsCommands: Record<string, (...args: any[]) => void> = {
      [wsServer.SEED_NAME]: (msg: string) => staggerSay(target, msg),
      [wsServer.GAME_START_TIME]: (startTime: number) =>
        staggerSay(
          target,
          `New game '${game.seed}' launched: ${new Date(startTime).toString()}`
        ),
      [wsServer.INFO]: (info: string) => staggerSay(target, info),
    };
    return (type: string, ...args: any[]) => {
      if (!wsCommands[type]) {
        console.log(`Issue: ${type}, ${args}`);
      } else {
        wsCommands[type](...args);
      }
    };
  };
  // handlers
  const startGame: ChatHandler = (target, _context, message, _isSelf) => {
    if (isLiveGame()) {
      staggerSay(
        target,
        `Sorry. Game is in progress. Current Status: ${game.gameState}`
      );
    } else {
      const seed: string | undefined = message
        .split(" ")
        .filter((x) => x.length)[1];
      game = new GameManager({ toFrontEnd: emitParser(target) }, seed);
      game.handleStartGame();
    }
  };
  return {
    startGame,
  };
};

export default gameHandlers;
