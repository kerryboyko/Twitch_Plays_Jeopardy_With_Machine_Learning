/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";
import { Client } from "tmi.js";
import GameManager from "../../GameManager";
import { ChatHandler, GameState } from "../../types";

// eslint-disable-next-line @typescript-eslint/ban-types

export const gameHandlers = (
  io: Server,
  client: Client,
  _text: Record<string, string[]>
): Record<string, ChatHandler> => {
  let game: GameManager;

  const isLiveGame = (): boolean =>
    game !== undefined && game.gameState !== GameState.FinalScores;

  const staggerSay = (() => {
    const queue: [string, string][] = [];
    setInterval(() => {
      if (queue.length > 0) {
        const next = queue.shift() as [string, string];
        client.say(...next);
      }
    }, 2000);
    return (...args: [string, string]) => {
      queue.push(args);
    };
  })();

  // handlers
  const startGame: ChatHandler = (target, _context, _message, _isSelf) => {
    if (isLiveGame()) {
      staggerSay(
        target,
        `Sorry. Game is in progress. Current Status: ${game.gameState}`
      );
    } else {
      game = new GameManager();
    }
  };
  return {
    startGame,
  };
};

export default gameHandlers;
