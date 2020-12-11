import fs from "fs";
import { ClueState, FinalJeopardyState, GameState } from "../types";
import Game, { getLog } from "./Game";
import mockClues from "./mocks/gClues.json";
import mockJeopardyBoard from "./mocks/gJeopardyBoard.json";
import mockDoubleJeopardyBoard from "./mocks/gDoubleJeopardyBoard.json";
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
      game.handleRegisterPlayer("alpha");
      game.handleRegisterPlayer("beta");
      game.handleRegisterPlayer("gamma");
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
            ["indulgent", "self-indulgent reality tv"],
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
      expect(game.clueState).toBe(ClueState.PromptSelectClue);
    });
  });
  describe("public async onClueSelected", () => {
    it("reprompts on an invalid clue", async () => {
      await game.changeClueState(ClueState.ClueSelected, [7, 8]);
      const log = getLatestLog();
      expect(log.map((el) => el[0])).toEqual([
        "wsServer.CLUE_STATE_CHANGE",
        "wsServer.INVALID_CLUE_SELECTION",
        "wsServer.CLUE_STATE_CHANGE",
        "wsServer.PROMPT_SELECT_CLUE",
      ]);
      expect(game.clueState).toBe(ClueState.PromptSelectClue);
    });
    it("grabs a valid clue", async () => {
      await game.changeClueState(ClueState.ClueSelected, [0, 0]);
      expect(game.currentClue).toEqual({
        answer: "Jackie Robinson",
        category: "42",
        id: 120457,
        indices: [0, 0],
        isDailyDouble: false,
        question:
          "The Dodgers retired his no. 42 jersey number in 1972 & all of MLB did in 1997",
        value: 200,
      });
      const log = getLatestLog();
      expect(log).toEqual([
        ["wsServer.CLUE_STATE_CHANGE", "Clue Selected"],
        ["wsServer.CLUE_STATE_CHANGE", "Display Clue"],
        [
          "wsServer.DISPLAY_CLUE",
          {
            category: "42",
            id: 120457,
            question:
              "The Dodgers retired his no. 42 jersey number in 1972 & all of MLB did in 1997",
            value: 200,
          },
        ],
      ]);
      expect(game.clueState).toBe(ClueState.DisplayClue);
    });
    describe("public handleAnswer", () => {
      it("grabs and stores answers", () => {
        expect(game.currentPlayerAnswers).toEqual([]);
        game.handleAnswer("alpha", "jackie robinson");
        game.handleAnswer("beta", "jackie robinette");
        game.handleAnswer("gamma", "babe ruth");
        expect(game.currentPlayerAnswers).toEqual([
          {
            playerName: "alpha",
            evaluated: null,
            provided: "jackie robinson",
          },
          {
            playerName: "beta",
            evaluated: null,
            provided: "jackie robinette",
          },
          {
            playerName: "gamma",
            evaluated: null,
            provided: "babe ruth",
          },
        ]);
      });
    });
    describe("public async onDisplayAnswer", () => {
      it("displays the answer and scores, queues up the next", async () => {
        await game.changeClueState(ClueState.DisplayAnswer);
        expect(game.clueState).toBe(ClueState.DisplayAnswer);
        expect(game.board.clueSet[0].clues[0]).toBe(null);
        expect(game.currentPlayerAnswers).toEqual([
          {
            playerName: "alpha",
            evaluated: true,
            provided: "jackie robinson",
          },
          {
            playerName: "beta",
            evaluated: true,
            provided: "jackie robinette",
          },
          {
            playerName: "gamma",
            evaluated: false,
            provided: "babe ruth",
          },
        ]);
        expect(game.scoreboard).toEqual({
          alpha: 200,
          beta: 200,
          gamma: -200,
        });
        const log = getLatestLog();
        expect(log).toEqual([
          ["wsServer.CLUE_STATE_CHANGE", "Display Answer"],
          [
            "wsServer.DISPLAY_ANSWER",
            {
              answer: "Jackie Robinson",
              currentScores: {
                alpha: 200,
                beta: 200,
                gamma: -200,
              },
              id: 120457,
              provided: [
                {
                  playerName: "alpha",
                  evaluated: true,
                  provided: "jackie robinson",
                },
                {
                  playerName: "beta",
                  evaluated: true,
                  provided: "jackie robinette",
                },
                {
                  playerName: "gamma",
                  evaluated: false,
                  provided: "babe ruth",
                },
              ],
              question:
                "The Dodgers retired his no. 42 jersey number in 1972 & all of MLB did in 1997",
              value: 200,
            },
          ],
        ]);
        expect(game.controllingPlayer).toBe("alpha");
      });
    });
    describe("public async onDailyDouble", () => {
      it("displays the answer and scores, queues up the next", async () => {
        // have to do this manually in tests.
        await game.changeClueState(ClueState.PromptSelectClue);
        // let's manually edit the score
        game.scoreboard.alpha = 1600;
        // this is a Daily Double!
        await game.changeClueState(ClueState.ClueSelected, [5, 2]);
        expect(game.currentClue.isDailyDouble).toBe(true);
        expect(game.clueState).toBe(ClueState.DailyDouble);
        const log = getLatestLog();
        expect(log).toEqual([
          ["wsServer.CLUE_STATE_CHANGE", "Prompt Select Clue"],
          [
            "wsServer.PROMPT_SELECT_CLUE",
            "alpha, you have control of the board, select a category.",
          ],
          ["wsServer.CLUE_STATE_CHANGE", "Clue Selected"],
          ["wsServer.CLUE_STATE_CHANGE", "Daily Double"],
          [
            "wsServer.GET_DD_WAGER",
            {
              maxValue: 1600,
              player: "alpha",
            },
          ],
        ]);
      });
    });
    describe("handleWager", () => {
      it("does nothing if the wager isn't real", async () => {
        await game.handleWager("beta", 1000);
        expect(game.clueState).toBe(ClueState.DailyDouble);
      });
      it("handles the controlling player's wager and moves forward", async () => {
        await game.handleWager("alpha", 1200);
        expect(game.wagers).toEqual({ alpha: 1200 });
        expect(game.clueState).toEqual(ClueState.DisplayClue);
        const log = getLatestLog();
        expect(log).toEqual([
          ["wsServer.WAGER_RECEIVED", "alpha", 1200],
          ["wsServer.CLUE_STATE_CHANGE", "Display Clue"],
          [
            "wsServer.DISPLAY_CLUE",
            {
              category: "biblical who's who",
              id: 127984,
              question:
                "That must have been some exorcism when Jesus cast 7 devils out of her",
              value: 600,
            },
          ],
        ]);
      });
      it("ignores answers not from the controlling player", async () => {
        await game.handleAnswer("beta", "betty white");
        expect(game.currentPlayerAnswers).toEqual([]);
        expect(game.clueState).toBe(ClueState.DisplayClue);
        await game.handleAnswer("alpha", "mary magdeline");
        expect(game.clueState).toBe(ClueState.DisplayAnswer);
        expect(game.currentPlayerAnswers).toEqual([
          { evaluated: true, playerName: "alpha", provided: "mary magdeline" },
        ]);
        expect(game.board.clueSet[5].clues[2]).toBe(null);
        expect(game.scoreboard).toEqual({
          alpha: 2800,
          beta: 200,
          gamma: -200,
        });
        expect(game.controllingPlayer).toBe("alpha");
        const log = getLatestLog();
        expect(log).toEqual([
          ["wsServer.CLUE_STATE_CHANGE", "Display Answer"],
          [
            "wsServer.DISPLAY_ANSWER",
            {
              answer: "Mary Magdelene",
              currentScores: {
                alpha: 2800,
                beta: 200,
                gamma: -200,
              },
              id: 127984,
              provided: [
                {
                  evaluated: true,
                  playerName: "alpha",
                  provided: "mary magdeline",
                },
              ],
              question:
                "That must have been some exorcism when Jesus cast 7 devils out of her",
              value: 600,
            },
          ],
        ]);
      });
    });
    describe("advance the round", () => {
      it("advances the round", async () => {
        expect(game.clueState).toBe(ClueState.DisplayAnswer);
        expect(game.gameState).toBe(GameState.Jeopardy);
        // nullify the clueset.
        for (let i = 0, l = game.board.clueSet.length; i < l; i++) {
          game.board.clueSet[i].clues = [null, null, null, null, null];
        }
        // should advance the round.
        await game.changeClueState(ClueState.PromptSelectClue);

        // lowest score should go first in Double Jeopardy.
        expect(game.controllingPlayer).toBe("gamma");
        expect(game.clueState).toBe(ClueState.PromptSelectClue);
        expect(game.gameState).toBe(GameState.DoubleJeopardy);
        expect(game.board).toEqual(mockDoubleJeopardyBoard);
        const log = getLatestLog();
        expect(log).toEqual([
          ["wsServer.CLUE_STATE_CHANGE", "Prompt Select Clue"],
          [
            "wsServer.END_OF_ROUND",
            "And that is the end of our first Jeopardy round",
          ],
          ["wsServer.GAME_STATE_CHANGE", "Double Jeopardy"],
          [
            "wsServer.SEND_CATEGORIES",
            [
              ["covers", "under the covers"],
              ["sam", "sam i am"],
              ["professional", "professional sports"],
              ["strait", "strait ahead"],
              ["under", '"over" & "under"'],
              ["properly", "spat tha properly spelld wurd"],
            ],
          ],
          [
            "wsServer.CHANGE_CONTROLLER",
            {
              controllingPlayer: "gamma",
              message:
                "At the end of the last round, gamma was in last place, so they will go first in Double Jeopardy.",
            },
          ],
          ["wsServer.CLUE_STATE_CHANGE", "Prompt Select Clue"],
          [
            "wsServer.PROMPT_SELECT_CLUE",
            "gamma, you have control of the board, select a category.",
          ],
        ]);
      });
      it("advances to final jeopardy", async () => {
        expect(game.gameState).toBe(GameState.DoubleJeopardy);
        // nullify the double jeopary clueset.
        for (let i = 0, l = game.board.clueSet.length; i < l; i++) {
          game.board.clueSet[i].clues = [null, null, null, null, null];
        }
        // should advance the round.  This is... not normally a viable path,
        // but it should be fine for test purposes.
        await game.changeClueState(ClueState.PromptSelectClue);
        expect(game.clueState).toBe(ClueState.PromptSelectClue);
        expect(game.gameState).toBe(GameState.FinalJeopardy);
        expect(game.finalJeopardyState).toBe(
          FinalJeopardyState.DisplayFinalCategory
        );
        expect(game.currentClue).toEqual({
          answer: "freebooter",
          category: `hey, "boo"`,
          id: 64053,
          indices: [-1, -1],
          isDailyDouble: false,
          question: `Another word for pirate, it's derived from the same Dutch word as "filibuster"`,
          value: 0,
        });
        // lowest score should go first in Double Jeopardy.
        const log = getLatestLog();
        expect(log).toEqual([
          ["wsServer.CLUE_STATE_CHANGE", "Prompt Select Clue"],
          ["wsServer.END_OF_ROUND", "And that is the end of Double Jeopardy"],
          ["wsServer.GAME_STATE_CHANGE", "Final Jeopardy"],
          ["wsServer.FINAL_JEOPARDY_STATE_CHANGE", "Display FJ Category"],
          [
            "wsServer.FJ_DISPLAY_CATEGORY",
            {
              category: `hey, "boo"`,
              message:
                "And now, the Final Jeopardy category.  Place your final wagers",
            },
          ],
        ]);
      });
    });
  });
  describe("finalJeopardy", () => {
    it("handles wagers", () => {
      expect(game.finalJeopardyState).toBe(
        FinalJeopardyState.DisplayFinalCategory
      );
      game.handleWager("alpha", 1000);
      game.handleWager("beta", 1000);
      game.handleWager("gamma", 1000);
      expect(game.wagers).toEqual({
        alpha: 1000,
        beta: 200,
      });
      const log = getLatestLog();
      expect(log).toEqual([
        ["wsServer.WAGER_RECEIVED", "alpha"],
        ["wsServer.WAGER_RECEIVED", "beta"],
      ]);
    });
    it("displays the clue", async () => {
      await game.changeFinalJeopardyState(FinalJeopardyState.DisplayClue);
      expect(game.finalJeopardyState).toBe(FinalJeopardyState.DisplayClue);
      const log = getLatestLog();
      expect(log).toEqual([
        ["wsServer.FINAL_JEOPARDY_STATE_CHANGE", "Display FJ Clue"],
        [
          "wsServer.FJ_DISPLAY_CLUE",
          {
            category: `hey, "boo"`,
            id: 64053,
            question: `Another word for pirate, it's derived from the same Dutch word as "filibuster"`,
          },
        ],
        ["wsServer.PLAY_THINK_MUSIC"],
      ]);
    });
    it("handles answers", () => {
      game.handleAnswer("alpha", "bootineer");
      game.handleAnswer("beta", "freebooter");
      game.handleAnswer("gamma", "freebooter"); // should be ignored
      expect(game.currentPlayerAnswers).toEqual([
        {
          evaluated: null,
          playerName: "alpha",
          provided: "bootineer",
        },
        {
          evaluated: null,
          playerName: "beta",
          provided: "freebooter",
        },
        {
          evaluated: null,
          playerName: "gamma",
          provided: "freebooter",
        },
      ]);
      const log = getLatestLog();
      expect(log).toEqual([]);
    });
    it("handles the final scores", async () => {
      expect(game.wagers).toEqual({
        alpha: 1000,
        beta: 200,
      });
      await game.changeFinalJeopardyState(FinalJeopardyState.DisplayAnswer);
      expect(game.finalJeopardyState).toBe(FinalJeopardyState.DisplayAnswer);
      expect(game.gameState).toBe(GameState.FinalScores);
      expect(game.scoreboard).toEqual({
        alpha: 1800,
        beta: 400,
        gamma: -200,
      });
      const log = getLatestLog();
      expect(log).toEqual([
        ["wsServer.FINAL_JEOPARDY_STATE_CHANGE", "Display FJ Answer"],
        [
          "wsServer.DISPLAY_ANSWER",
          {
            answer: "freebooter",
            currentScores: {
              alpha: 1800,
              beta: 400,
              gamma: -200,
            },
            id: 64053,
            provided: [
              {
                evaluated: false,
                playerName: "alpha",
                provided: "bootineer",
              },
              {
                evaluated: true,
                playerName: "beta",
                provided: "freebooter",
              },
              {
                evaluated: null,
                playerName: "gamma",
                provided: "freebooter",
              },
            ],
            question: `Another word for pirate, it's derived from the same Dutch word as "filibuster"`,
          },
        ],
        ["wsServer.GAME_STATE_CHANGE", "Final Scores"],
        [
          "wsServer.FINAL_SCORES",
          {
            finalScores: [
              ["alpha", 1800],
              ["beta", 400],
              ["gamma", -200],
            ],
            message:
              "Thanks for playing! A new game will start soon, type !register to join, or !judge to register as a judge",
          },
        ],
      ]);
    });
  });
});
