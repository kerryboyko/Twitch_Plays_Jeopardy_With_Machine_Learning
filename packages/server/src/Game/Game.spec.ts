import fs from "fs";
import { ClueState, GameState } from "../types";
import Game, { getLog } from "./Game";
import mockClues from "./mocks/gClues.json";
import mockJeopardyBoard from "./mocks/gJeopardyBoard.json";
/* hoo boy, here we go... */

const seedString = "test";

/* By casting the game instance as any, we can bypass 
   Typescript's checks on whether a member is "public" or "private"
   and therefore access the methods and properties directly. 
   */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

const game = new Game(seedString) as any;

const clearAllGameTimeouts = () =>
  Object.values(game.timeouts).forEach((timeout) =>
    clearTimeout(timeout as NodeJS.Timeout)
  );

// const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

const writeOut = (filename: string, data: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(filename, data, (err): void => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const getLatestLog = (() => {
  let lines = 0;
  return () => {
    const currentLog = getLog();
    const output = currentLog.slice(lines);
    lines = currentLog.length;
    return output;
  };
})();

describe("Class Game", () => {
  beforeEach(() => {
    clearAllGameTimeouts();
  });
  afterEach(() => {
    clearAllGameTimeouts();
  });
  describe("constructor()", () => {
    it("constructs", async () => {
      expect(game.seed).toBe("test");
      expect(game.rand).not.toBeUndefined();
      expect(game.gameState).toBe(GameState.None);
      expect(game.clueState).toBe(ClueState.None);
      expect(game.board).toEqual({ clueSet: [], lookup: {} });
      expect(game.clues).toEqual([]);
      expect(game.getNextClue()).toBe(null);
      const log = getLatestLog();
      expect(log).toEqual([]);
    });
  });
  describe("register player", () => {
    it("registers players", () => {
      game.registerPlayer("alpha");
      game.registerPlayer("beta");
      game.registerPlayer("gamma");
      expect(game.scoreboard).toEqual({
        alpha: 0,
        beta: 0,
        gamma: 0,
      });
      expect(game.controllingPlayer).toBe("alpha");
      const log = getLatestLog();
      expect(log).toEqual([
        ["wsServer.PLAYER_REGISTERED", "alpha"],
        ["wsServer.PLAYER_REGISTERED", "beta"],
        ["wsServer.PLAYER_REGISTERED", "gamma"],
      ]);
    });
  });
  describe("public async startGame()", () => {
    it("starts the game / runs onLoadingGame", async () => {
      await game.startGame();
      expect(game.clues).toEqual(mockClues);
      expect(game.timeouts).toHaveProperty("gameLoaded"); // this'll clear, but we want it to be defined for now.
      const log = getLatestLog();
      expect(log).toEqual([
        ["wsServer.GAME_START_TIME", log[0][1]],
        [
          "wsServer.INFO",
          "Type !register to register to play. Game will start in 3 minutes",
        ],
        ["wsServer.GAME_STATE_CHANGE", "LoadingGame"],
      ]);
      expect(game.gameState).toBe(GameState.LoadingGame);
    });
  });
  describe("public async onJeopardy", () => {
    it("onJeopardy", async () => {
      await game.changeGameState(GameState.Jeopardy);
      expect(game.board).toEqual(mockJeopardyBoard);
      expect(["alpha", "beta", "gamma"].includes(game.controllingPlayer)).toBe(
        true
      );
      const log = getLatestLog();
      expect(log.slice(0, 2)).toEqual([
        ["wsServer.GAME_STATE_CHANGE", "Jeopardy"],
        [
          "wsServer.SEND_CATEGORIES",
          [
            ["42", "42"],
            ["uruguay", "ur in uruguay"],
            ["self-indulgent", "self-indulgent reality tv"],
            ["monuments", "the monuments women"],
            ["sequelitis", "sequelitis"],
            ["biblical", "biblical who's who"],
          ],
        ],
      ]);
      expect(log[2][0]).toBe("wsServer.CHANGE_CONTROLLER");
      expect(log[2][1].message.startsWith("The luck of")).toBe(true);
      expect(Object.keys(log[2][1]).sort()).toEqual([
        "controllingPlayer",
        "message",
      ]);
      expect(log[3]).toEqual([
        "wsServer.CLUE_STATE_CHANGE",
        "Prompt Select Clue",
      ]);
      expect(log[4][0]).toBe("wsServer.PROMPT_SELECT_CLUE");
    });
  });
});
