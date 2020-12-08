import randomSeed, { RandomSeed } from "random-seed";
// import getDailyDoubles from "./getDailyDoubles";
import { isInteger, pick } from "lodash";
import getClues from "../db/services/getClues";
import createBoard from "./utils/createBoard";
import { MINUTE } from "./utils/constants";
import { JeopardyClue, ClueCategory } from "../types";
import { wsServer } from "../sockets/commands";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeEmit = (...stuff: any[]) => console.log(...stuff);

enum GameState {
  LoadingQuestions = "Loading Questions",
  PreGame = "PreGame",
  Jeopardy = "Jeopardy",
  DoubleJeopardy = "Double Jeopardy",
  FinalJeopardy = "Final Jeopardy",
  FinalScores = "Final Scores",
}
enum ClueState {
  NoClue = "No Clue Loaded",
  SelectClue = "Select Clue",
  DisplayClue = "Display Clue",
  DisplayAnswer = "Display Answer",
}

// enum DailyDoubleStates {
//   GetWager,
//   DisplayClue,
//   DisplayAnswer,
// }

// enum FinalJeopardyStates {
//   DisplayCategory,
//   GetWager,
//   DisplayClue,
//   DisplayAnswer,
// }

class Game {
  private readonly rand: RandomSeed;

  private gameStartTime = 0;

  private timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

  private clues: ClueCategory[] = [];

  private gameState = GameState.LoadingQuestions;

  private clueState = ClueState.NoClue;

  private board: {
    clueSet: { category: string; clues: (JeopardyClue | null)[] }[];
    lookup: Record<string, number>;
  } = { clueSet: [], lookup: {} };

  public currentClue: {
    category: string;
    question: string;
    answer: string;
    value: number;
    indices: [number, number];
  } = {
    category: "",
    question: "",
    answer: "",
    value: 0,
    indices: [-1, -1],
  };

  public controllingPlayer = "";

  public scoreboard: Record<string, number> = {};

  constructor(seed?: string) {
    this.rand = seed ? randomSeed.create(seed) : randomSeed.create();
    getClues.fullBoard(this.rand).then((clues) => {
      this.clues = clues;
      this.prepGame();
    });
  }

  public registerPlayer = (playerName: string): void => {
    if (!this.scoreboard[playerName]) {
      this.scoreboard[playerName] = 0;
    }
  };

  public prepGame = (): void => {
    this.board = createBoard(this.clues.slice(0, 6));
    this.changeGameState(GameState.PreGame);
    this.changeClueState(ClueState.NoClue);
  };

  public startGame = (): void => {
    this.changeGameState(GameState.Jeopardy);
    this.changeClueState(ClueState.SelectClue);
  };

  /* We probably want to put the emits here. */
  public changeGameState = (gameState: GameState): void => {
    this.gameState = gameState;
    fakeEmit(wsServer.GAME_STATE_CHANGE, gameState);
    if (gameState === GameState.PreGame) {
      this.gameStartTime = Date.now() + 3 * MINUTE;
      fakeEmit(wsServer.GAME_START_TIME, this.gameStartTime);
      fakeEmit(
        wsServer.INFO,
        `Type !register to register to play. Game will start in 3 minutes`
      );
      this.timeouts.twoMinuteWarning = setTimeout(() => {
        fakeEmit(
          wsServer.INFO,
          `Type !register to register to play. Game will start in 2 minutes`
        );
      }, 1 * MINUTE);
      this.timeouts.oneMinuteWarning = setTimeout(() => {
        fakeEmit(
          wsServer.INFO,
          `Type !register to register to play. Game will start in 1 minute`
        );
      }, 2 * MINUTE);
      this.timeouts.startGame = setTimeout(() => {
        this.startGame();
        for (const timeout of Object.values(this.timeouts)) {
          clearTimeout(timeout);
        }
      }, 3 * MINUTE);
    }
    if (gameState === GameState.Jeopardy) {
      // in case we start early
      for (const timeout of Object.values(this.timeouts)) {
        clearTimeout(timeout);
      }
    }
  };

  /* Same - put emits in here.  */
  public changeClueState = (clueState: ClueState): void => {
    this.clueState = clueState;
    fakeEmit(wsServer.CLUE_STATE_CHANGE, clueState);
    if (clueState === ClueState.SelectClue) {
      fakeEmit(
        wsServer.SelectClue,
        `${
          this.controllingPlayer || "this.controllingPlayer"
        }, you have control of the board, select a category.`
      );
    }
    if (clueState === ClueState.DisplayClue) {
      fakeEmit(
        wsServer.DisplayClue,
        pick(this.currentClue, ["question", "category", "value"])
      );
    }
  };

  public selectClue = (categoryKeyword: string, value: number): void => {
    try {
      const valueIndex =
        value / (this.gameState === GameState.Jeopardy ? 200 : 400);
      const categoryIndex = this.board.lookup[categoryKeyword];
      if (
        categoryIndex === undefined ||
        !isInteger(valueIndex) ||
        valueIndex < 0 ||
        valueIndex > 4 ||
        this.board.clueSet[categoryIndex].clues[valueIndex] === null
      ) {
        throw new Error(`Invalid selection - Please Try Again`);
      }
      const { question, answer, category } = pick(
        this.board.clueSet[categoryIndex].clues[valueIndex],
        ["question", "answer", "category"]
      );
      this.currentClue = {
        category: category?.title as string,
        question: question as string,
        answer: answer as string,
        value,
        indices: [categoryIndex, valueIndex],
      };
      // probably want to emit on setting the current clue.
      this.changeClueState(ClueState.DisplayClue);
    } catch (e) {
      throw new Error(e); // we'll have some websocket handlers to prompt the user to try again here.
    }
  };
}

export default Game;
