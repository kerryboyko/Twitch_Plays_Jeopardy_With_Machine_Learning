import { clear } from "console";
import { ClueState, GameState } from "../types";
import Game, { getLog } from "./Game";

const seedString = "test";

/* hoo boy, here we go... */

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

describe("Class Game", () => {
  beforeEach(() => {
    clearAllGameTimeouts();
  });
  afterEach(() => {
    clearAllGameTimeouts();
  });
  describe("constructor()", () => {
    expect(game.seed).toBe("test");
    const currentLog = getLog();
    expect(currentLog).toEqual([
      ["wsServer.GAME_STATE_CHANGE", "LoadingGame"],
      ["wsServer.GAME_START_TIME", currentLog[1][1]],
      [
        "wsServer.INFO",
        "Type !register to register to play. Game will start in 3 minutes",
      ],
    ]);
    expect(game.gameState).toBe(GameState.LoadingGame);
    expect(game.clueState).toBe(ClueState.None);
    expect(game.board).toEqual({ clueSet: [], lookup: {} });
    expect(game.clues).toBe([]);
    // TODO: Test the rest of the state.  MAYBE put a setTimeout
    // to test the clues were loaded?
  });
});
