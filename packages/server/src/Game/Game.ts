import randomSeed, { RandomSeed } from "random-seed";
import isInteger from "lodash/isInteger";
import noop from "lodash/noop";
import pick from "lodash/pick";
import get from "lodash/get";
import getClues from "../db/services/getClues";
import createBoard from "./utils/createBoard";
import { MINUTE } from "./utils/constants";
import genSeedString from "./utils/genSeedString";
import getNextClue from "./utils/getNextClue";
import pickOneAtRandom from "./utils/pickOneAtRandom";
import { wsServer } from "../sockets/commands";

import {
  ClueCategory,
  GameState,
  ClueState,
  FinalJeopardyState,
  DailyDoubleState,
  States,
} from "../types";

/* fake Emit will likely be replaced soon with websockets for sending to the front end.
   For now, it console.logs */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeEmit = (...stuff: any[]) => console.log(...stuff);

// this may be broken up into "game" and "clue" -- but we'll see how this works out first.
class Game {
  private rand: RandomSeed;

  private gameState: GameState = GameState.None;

  private clueState: ClueState = ClueState.None;

  private dailyDoubleState: DailyDoubleState = DailyDoubleState.None;

  private finalJeopardyState: FinalJeopardyState = FinalJeopardyState.None;

  private gameStartTime = 0;

  private timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

  // we grab this once, then it's read-only.
  private clues: ClueCategory[] = [];

  // this is the live board which is mutable
  private board: {
    clueSet: ClueCategory[];
    lookup: Record<string, number>;
  } = { clueSet: [], lookup: {} };

  public currentClue: {
    category: string;
    question: string;
    answer: string;
    value: number;
    indices: [number, number]; // index value on board, stored for convenience.
  } = {
    category: "",
    question: "",
    answer: "",
    value: 0, // usually determined by indices, but not in the case of daily double or final jeopardy
    indices: [-1, -1],
  };

  public controllingPlayer = ""; // player has control of the board. Only the controlling player can play a Daily Double.

  public scoreboard: Record<string, number> = {};

  constructor(public seed: string = genSeedString()) {
    this.rand = randomSeed.create(seed);
    this.changeGameState(GameState.LoadingGame);
  }

  public getSeed = (): string => this.seed;

  // used to grab the next clue automatically
  // as well as check to see if we should go to next round.
  private getNextClue = (): [number, number] | null =>
    getNextClue(this.board.clueSet);

  public registerPlayer = (playerName: string): void => {
    if (!this.scoreboard[playerName]) {
      this.scoreboard[playerName] = 0;
    }
  };

  // GAME STATE HANDLERS
  private onLoadingGame = async (): Promise<void> => {
    this.gameStartTime = Date.now() + 3 * MINUTE;
    fakeEmit(wsServer.GAME_START_TIME, this.gameStartTime);
    fakeEmit(
      wsServer.INFO,
      `Type !register to register to play. Game will start in 3 minutes`
    );
    const clues = await getClues.fullBoard(this.rand);
    this.clues = clues;
    this.timeouts.startGame = setTimeout(() => {
      this.changeGameState(GameState.Jeopardy);
    }, 3 * MINUTE);
  };

  private onJeopardy = (isDoubleJeopardy: boolean): void => {
    // we may run this early, so we clear the timeout if we haven't already.
    clearTimeout(this.timeouts.startGame);
    // get our clues
    const clueSlice = this.clues.slice(
      ...(isDoubleJeopardy ? [0, 6] : [6, 12])
    );
    // create board
    this.board = createBoard(clueSlice, this.rand, isDoubleJeopardy);
    fakeEmit(
      wsServer.SEND_CATEGORIES,
      this.board.clueSet.map((clueCategory: ClueCategory) => [
        clueCategory.key,
        clueCategory.category,
      ])
    );
    if (!isDoubleJeopardy) {
      this.controllingPlayer = pickOneAtRandom(Object.keys(this.scoreboard));
      fakeEmit(wsServer.CHANGE_CONTROLLER, {
        controllingPlayer: this.controllingPlayer,
        message: `The luck of the draw has given ${this.controllingPlayer} the first selection today`,
      });
    } else {
      for (const player in this.scoreboard) {
        if (this.scoreboard[player] < this.scoreboard[this.controllingPlayer]) {
          this.controllingPlayer = player;
        }
      }
      fakeEmit(wsServer.CHANGE_CONTROLLER, {
        controllingPlayer: this.controllingPlayer,
        message: `${this.controllingPlayer}, you'll go first in Double Jeopardy.`,
      });
    }

    this.changeClueState(ClueState.PromptSelectClue);
  };

  private onFinalJeopardy = noop;

  private onFinalScores = noop;

  private advanceRound = (): void | never => {
    if (this.gameState === GameState.Jeopardy) {
      fakeEmit(
        wsServer.END_OF_ROUND,
        `And that is the end of our first Jeopardy round`
      );

      this.changeGameState(GameState.DoubleJeopardy);
    } else if (this.gameState === GameState.DoubleJeopardy) {
      fakeEmit(wsServer.END_OF_ROUND, `And that is the end of Double Jeopardy`);

      this.changeGameState(GameState.FinalJeopardy);
    } else {
      throw new Error(
        `How did we get here? this.gameState is ${this.gameState}`
      );
    }
  };

  // CLUE STATE HANDLERS

  private onDisplayClue = noop;

  private onDailyDouble = noop;

  private onDisplayAnswer = noop;

  private onPromptSelectClue = () => {
    const nextClue = this.getNextClue();
    // check if we should advance to the next round.
    if (nextClue === null) {
      return this.advanceRound(); // abort, advance
    }
    fakeEmit(
      wsServer.PROMPT_SELECT_CLUE,
      `${this.controllingPlayer}, you have control of the board, select a category.`
    );
    this.timeouts.promptSelectClue = setTimeout(() => {
      fakeEmit(
        wsServer.CLUE_SELECTION_TIMEOUT,
        `We're Selecting next clue automatically`
      );
      this.onClueSelected(nextClue);
    }, MINUTE);
  };

  public onClueSelected = ([categoryIndex, valueIndex]: [
    number,
    number
  ]): void => {
    if (
      categoryIndex === undefined ||
      !isInteger(valueIndex) ||
      valueIndex < 0 ||
      valueIndex > 4 ||
      this.board.clueSet[categoryIndex].clues[valueIndex] === null
    ) {
      clearTimeout(this.timeouts.promptSelectClue);
      fakeEmit(
        wsServer.INVALID_CLUE_SELECTION,
        `${this.controllingPlayer}, you have control of the board, select a category.`
      );
      return this.onPromptSelectClue();
    }
    const { question, answer, category } = pick(
      this.board.clueSet[categoryIndex].clues[valueIndex],
      ["question", "answer", "category"]
    );
    this.currentClue = {
      category: category?.title as string,
      question: question as string,
      answer: answer as string,
      value:
        (valueIndex + 1) *
        (this.gameState === GameState.DoubleJeopardy ? 400 : 200),
      indices: [categoryIndex, valueIndex],
    };
    // probably want to emit on setting the current clue.
    this.changeClueState(ClueState.DisplayClue);
  };

  // daily double state handlers

  private onDisplayDailyDoubleClue = noop;

  private onDisplayDailyDoubleAnswer = noop;

  // final jeopardy state handlers

  private onDisplayFinalCategory = noop;

  private onDisplayFinalClue = noop;

  private onDisplayFinalAnswer = noop;

  // Game State Machine (must be public to use abstraction);
  public gameStateMachine = {
    [GameState.None]: {
      [GameState.LoadingGame]: this.onLoadingGame,
    },
    [GameState.LoadingGame]: {
      [GameState.Jeopardy]: (): void => this.onJeopardy(false),
    },
    [GameState.Jeopardy]: {
      [GameState.DoubleJeopardy]: (): void => this.onJeopardy(true),
    },
    [GameState.DoubleJeopardy]: {
      [GameState.FinalJeopardy]: this.onFinalJeopardy,
    },
    [GameState.FinalJeopardy]: {
      [GameState.FinalScores]: this.onFinalScores,
    },
    [GameState.FinalScores]: {
      [GameState.LoadingGame]: this.onLoadingGame,
    },
  };

  public clueStateMachine = {
    [ClueState.None]: {
      [ClueState.PromptSelectClue]: this.onPromptSelectClue,
    },
    [ClueState.PromptSelectClue]: {
      [ClueState.ClueSelected]: this.onClueSelected,
    },
    [ClueState.ClueSelected]: {
      [ClueState.DisplayClue]: this.onDisplayClue,
      [ClueState.DailyDouble]: this.onDailyDouble,
    },
    [ClueState.DisplayClue]: {
      [ClueState.DisplayAnswer]: this.onDisplayAnswer,
    },
    [ClueState.DisplayAnswer]: {
      [ClueState.PromptSelectClue]: this.onPromptSelectClue,
    },
  };

  public dailyDoubleStateMachine = {
    [DailyDoubleState.None]: {
      [DailyDoubleState.DisplayClue]: this.onDisplayDailyDoubleClue,
    },
    [DailyDoubleState.DisplayClue]: {
      [DailyDoubleState.DisplayAnswer]: this.onDisplayDailyDoubleAnswer,
    },
  };

  public finalJeopardyStateMachine = {
    [FinalJeopardyState.None]: {
      [FinalJeopardyState.DisplayFinalCategory]: this.onDisplayFinalCategory,
    },
    [FinalJeopardyState.DisplayFinalCategory]: {
      [FinalJeopardyState.DisplayClue]: this.onDisplayFinalClue,
    },
    [FinalJeopardyState.DisplayClue]: {
      [FinalJeopardyState.DisplayAnswer]: this.onDisplayFinalAnswer,
    },
  };

  private initStateMachine = <TEnum extends States, TMachine>(
    currentState: TEnum,
    stateMachine: TMachine,
    emitOnChange: (arg1: TEnum) => void
  ) => (nextState: TEnum) => {
    const next = get(stateMachine, [currentState, nextState], null);
    if (next === null) {
      throw new Error(
        `Illegal state transition. ${currentState} does not support transition ${currentState} -> ${nextState}`
      );
    }
    /* We want to reassign the parameter here as a side effect */
    // eslint-disable-next-line no-param-reassign
    currentState = nextState;
    emitOnChange(nextState);
    next();
  };

  public changeGameState = this.initStateMachine<
    GameState,
    Game["gameStateMachine"]
  >(this.gameState, this.gameStateMachine, (state) =>
    fakeEmit(wsServer.GAME_STATE_CHANGE, state)
  );

  public changeClueState = this.initStateMachine<
    ClueState,
    Game["clueStateMachine"]
  >(this.clueState, this.clueStateMachine, (state) =>
    fakeEmit(wsServer.CLUE_STATE_CHANGE, state)
  );

  public changeDailyDoubleState = this.initStateMachine<
    DailyDoubleState,
    Game["dailyDoubleStateMachine"]
  >(this.dailyDoubleState, this.dailyDoubleStateMachine, (state) =>
    fakeEmit(wsServer.DAILYDOUBLE_STATE_CHANGE, state)
  );

  public changeFinalJeopardyState = this.initStateMachine<
    FinalJeopardyState,
    Game["finalJeopardyStateMachine"]
  >(this.finalJeopardyState, this.finalJeopardyStateMachine, (state) =>
    fakeEmit(wsServer.FINAL_JEOPARDY_STATE_CHANGE, state)
  );
}

export default Game;
