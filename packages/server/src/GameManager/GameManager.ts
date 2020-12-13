/* eslint-disable @typescript-eslint/no-explicit-any */
import randomSeed, { RandomSeed } from "random-seed";
import pick from "lodash/pick";
import get from "lodash/get";
import isInteger from "lodash/isInteger";
import getClues from "../db/services/getClues";
import createBoard from "./utils/createBoard";
import { JTiming } from "./utils/constants";
import genSeedString from "./utils/genSeedString";
import getNextClue from "./utils/getNextClue";
import pickOneAtRandom from "./utils/pickOneAtRandom";
import { wsServer } from "../sockets/commands";
import answerEvaluator from "../logic/answerEvaluator";

import createStateMachine from "../logic/createStateMachine";

import {
  ClueCategory,
  GameState,
  ClueState,
  FinalJeopardyState,
  ProvidedAnswers,
  JeopardyClue,
} from "../types";

/* TODO: This is a refactor target.  What we PROBABLY should be doing is having four seperate classes:
   Game / Board / Clue / Final Jeopardy.  */

type Emitter = { toFrontEnd: (arg0: string, ...args: any[]) => void };
class GameManager {
  private rand: RandomSeed;

  private clueState: ClueState = ClueState.None;

  private finalJeopardyState: FinalJeopardyState = FinalJeopardyState.None;

  private gameStartTime = 0;

  private timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

  // we grab this once from the DB, then it's read-only.
  private clues: ClueCategory[] = [];

  // this is the live board which is mutable
  private board: {
    clueSet: ClueCategory[];
    lookup: Record<string, number>;
  } = { clueSet: [], lookup: {} };

  public gameState: GameState = GameState.None;

  public currentClue: {
    id: number;
    category: string;
    question: string;
    answer: string;
    value: number;
    indices: [number, number]; // index value on board, stored for convenience.
    isDailyDouble: boolean;
  } = {
    id: -1,
    category: "",
    question: "",
    answer: "",
    value: 0, // usually determined by indices, but not in the case of daily double or final jeopardy
    indices: [-1, -1],
    isDailyDouble: false,
  };

  public currentPlayerAnswers: ProvidedAnswers[] = [];

  public controllingPlayer = ""; // player has control of the board. Only the controlling player can play a Daily Double.

  public scoreboard: Record<string, number> = {};

  public wagers: Record<string, number> = {};

  /* CONSTRUCTOR! */
  constructor(public emit: Emitter, public seed: string = genSeedString()) {
    emit.toFrontEnd(wsServer.SEED_NAME, `Game Loading, seed: ${seed}`);
    this.rand = randomSeed.create(seed);
  }

  public getSeed = (): string => this.seed;

  // used to grab the next clue automatically
  // as well as check to see if we should go to next round.
  private getNextClue = (): [number, number] | null =>
    getNextClue(this.board.clueSet);

  // GAME STATE HANDLERS
  private onLoadingGame = async (): Promise<void> => {
    const clues = await getClues.fullBoard(this.rand);
    this.clues = clues;
    this.timeouts.gameLoaded = setTimeout(() => {
      this.changeGameState(GameState.Jeopardy);
    }, 3 * JTiming.startGame);
  };

  private onJeopardy = async (isDoubleJeopardy: boolean): Promise<void> => {
    // we may run this early, so we clear the timeout if we haven't already.
    clearTimeout(this.timeouts.gameLoaded);
    // get our clues
    const clueSlice = this.clues.slice(
      ...(isDoubleJeopardy ? [0, 6] : [6, 12])
    );
    // create board
    this.board = createBoard(clueSlice, this.rand, isDoubleJeopardy);
    this.emit.toFrontEnd(
      wsServer.SEND_CATEGORIES,
      this.board.clueSet.map((clueCategory: ClueCategory) => [
        clueCategory.key,
        clueCategory.category,
      ])
    );
    if (!isDoubleJeopardy) {
      this.controllingPlayer = pickOneAtRandom(Object.keys(this.scoreboard));
      this.emit.toFrontEnd(wsServer.CHANGE_CONTROLLER, {
        controllingPlayer: this.controllingPlayer,
        message: `The luck of the draw has given ${this.controllingPlayer} the first selection today`,
      });
    } else {
      for (const player in this.scoreboard) {
        if (this.scoreboard[player] < this.scoreboard[this.controllingPlayer]) {
          this.controllingPlayer = player;
        }
      }
      this.emit.toFrontEnd(wsServer.CHANGE_CONTROLLER, {
        controllingPlayer: this.controllingPlayer,
        message: `At the end of the last round, ${this.controllingPlayer} was in last place, so they will go first in Double Jeopardy.`,
      });
    }

    await this.changeClueState(ClueState.PromptSelectClue);
  };

  private advanceRound = async (): Promise<void> | never => {
    if (this.gameState === GameState.Jeopardy) {
      this.emit.toFrontEnd(
        wsServer.END_OF_ROUND,
        `And that is the end of our first Jeopardy round`
      );

      await this.changeGameState(GameState.DoubleJeopardy);
    } else if (this.gameState === GameState.DoubleJeopardy) {
      this.emit.toFrontEnd(
        wsServer.END_OF_ROUND,
        `And that is the end of Double Jeopardy`
      );

      await this.changeGameState(GameState.FinalJeopardy);
    } else {
      throw new Error(
        `How did we get here? this.gameState is ${this.gameState}`
      );
    }
  };

  // CLUE STATE HANDLERS

  private onPromptSelectClue = async (): Promise<void> => {
    // clear answers & wagers
    this.currentPlayerAnswers = [] as ProvidedAnswers[];
    this.wagers = {};
    const nextClue = this.getNextClue();
    // check if we should advance to the next round.
    if (nextClue === null) {
      return this.advanceRound(); // abort, advance
    }
    this.emit.toFrontEnd(
      wsServer.PROMPT_SELECT_CLUE,
      `${this.controllingPlayer}, you have control of the board, select a category.`
    );
    this.timeouts.promptSelectClue = setTimeout(() => {
      this.emit.toFrontEnd(
        wsServer.CLUE_SELECTION_TIMEOUT,
        `Selecting next clue automatically`
      );
      this.changeClueState(ClueState.ClueSelected, ...nextClue);
    }, JTiming.selectTime);
  };

  public onClueSelected = async (catVal: [number, number]): Promise<void> => {
    // bad clue.
    const [categoryIndex, valueIndex] = catVal;
    if (
      categoryIndex === undefined ||
      !isInteger(valueIndex) ||
      valueIndex < 0 ||
      valueIndex > 4 ||
      get(this.board.clueSet, [categoryIndex, "clues", valueIndex], null) ===
        null
    ) {
      clearTimeout(this.timeouts.promptSelectClue);
      this.emit.toFrontEnd(wsServer.INVALID_CLUE_SELECTION);

      return this.changeClueState(ClueState.PromptSelectClue);
    }

    // good clue.
    const { question, answer, category, isDailyDouble, id } = pick(
      this.board.clueSet[categoryIndex].clues[valueIndex],
      ["question", "answer", "category", "isDailyDouble", "id"]
    );
    this.currentClue = {
      id: id as number,
      category: category?.title as string,
      question: question as string,
      answer: answer as string,
      value:
        (valueIndex + 1) *
        (this.gameState === GameState.DoubleJeopardy ? 400 : 200),
      indices: [categoryIndex, valueIndex],
      isDailyDouble: isDailyDouble || false,
    };
    if (this.currentClue.isDailyDouble) {
      await this.changeClueState(ClueState.DailyDouble);
    } else {
      // probably want to emit on setting the current clue.
      await this.changeClueState(ClueState.DisplayClue);
    }
  };

  private onDisplayClue = () => {
    clearTimeout(this.timeouts.wagerTime); // for DDs and FJ
    this.emit.toFrontEnd(wsServer.DISPLAY_CLUE, {
      question: this.currentClue.question,
      id: this.currentClue.id,
      value: this.currentClue.value,
      category: this.currentClue.category,
    });
    this.timeouts.answerTime = setTimeout(() => {
      this.changeClueState(ClueState.DisplayAnswer);
    }, JTiming.answerTime);
  };

  private onDailyDouble = () => {
    this.emit.toFrontEnd(wsServer.GET_DD_WAGER, {
      player: this.controllingPlayer,
      maxValue: Math.max(
        this.gameState === GameState.Jeopardy ? 1000 : 2000,
        this.scoreboard[this.controllingPlayer]
      ),
    });
    this.timeouts.wagerTime = setTimeout(() => {
      this.changeClueState(ClueState.DisplayClue);
    }, JTiming.wagerTime);
  };

  private onDisplayAnswer = async () => {
    clearTimeout(this.timeouts.answerTime);
    // judge recieved answers
    await Promise.all(
      this.currentPlayerAnswers.map(
        async ({ playerName, provided }, index: number) => {
          const { final } = await answerEvaluator(
            this.currentClue.answer,
            provided
          );
          const value =
            this.gameState === GameState.FinalJeopardy ||
            this.currentClue.isDailyDouble
              ? this.wagers[playerName]
              : this.currentClue.value;
          this.currentPlayerAnswers[index].evaluated = final;
          // adjust scores
          if (final !== null) {
            this.scoreboard[playerName] += value * (final ? 1 : -1);
          }
        }
      )
    );
    // find first player to answer correctly.
    const controlAnswer = this.currentPlayerAnswers.find(
      ({ evaluated }) => evaluated === true
    );
    if (controlAnswer !== undefined) {
      this.controllingPlayer = controlAnswer.playerName;
    }
    // TODO: We may want to push the results to memory here,
    // or even store in the DB.

    // display the results
    this.emit.toFrontEnd(wsServer.DISPLAY_ANSWER, {
      answer: this.currentClue.answer,
      provided: this.currentPlayerAnswers,
      question: this.currentClue.question,
      id: this.currentClue.id,
      value: this.currentClue.value,
      currentScores: this.scoreboard,
    });
    // nullify the question;
    const [cat, val] = this.currentClue.indices;
    this.board.clueSet[cat].clues[val] = null;

    // clear answers and wagers;

    this.timeouts.afterAnswer = setTimeout(() => {
      this.changeClueState(ClueState.PromptSelectClue);
    }, JTiming.afterAnswer);
  };

  // final jeopardy state handlers

  private onFinalJeopardy = async (): Promise<void> => {
    const fjCategory = this.clues[12].category;
    const fjClue = this.clues[12].clues[4] as JeopardyClue; // most difficult question in the last category.
    this.currentClue = {
      id: fjClue.id as number,
      question: fjClue.question as string,
      answer: fjClue.answer as string,
      value: 0,
      isDailyDouble: false,
      indices: [-1, -1],
      category: fjCategory,
    };
    await this.changeFinalJeopardyState(
      FinalJeopardyState.DisplayFinalCategory
    );
  };

  private onDisplayFinalCategory = () => {
    this.emit.toFrontEnd(wsServer.FJ_DISPLAY_CATEGORY, {
      message: `And now, the Final Jeopardy category.  Place your final wagers`,
      category: this.currentClue.category,
    });
    this.timeouts.finalJeopardyWager = setTimeout(() => {
      this.changeFinalJeopardyState(FinalJeopardyState.DisplayClue);
    }, JTiming.wagerTime);
  };

  private onDisplayFinalClue = () => {
    clearTimeout(this.timeouts.wagerTime); // for DDs and FJ
    this.emit.toFrontEnd(wsServer.FJ_DISPLAY_CLUE, {
      category: this.currentClue.category,
      question: this.currentClue.question,
      id: this.currentClue.id,
    });
    this.emit.toFrontEnd(wsServer.PLAY_THINK_MUSIC);
    this.timeouts.answerTime = setTimeout(() => {
      this.changeClueState(ClueState.DisplayAnswer);
    }, JTiming.answerTime);
  };

  private onDisplayFinalAnswer = async () => {
    clearTimeout(this.timeouts.answerTime);
    // judge recieved answers

    await Promise.all(
      this.currentPlayerAnswers.map(
        async ({ playerName, provided }, index: number) => {
          const wager = this.wagers[playerName];
          if (wager === undefined || wager < 0) {
            return;
          }
          const { final } = await answerEvaluator(
            this.currentClue.answer,
            provided
          );
          this.currentPlayerAnswers[index].evaluated = final;

          // adjust scores
          if (final !== null && wager > 0) {
            this.scoreboard[playerName] += wager * (final ? 1 : -1);
          }
        }
      )
    );

    // TODO: We may want to push the results to memory here,
    // or even store in the DB.

    // display the results
    this.emit.toFrontEnd(wsServer.DISPLAY_ANSWER, {
      answer: this.currentClue.answer,
      provided: this.currentPlayerAnswers,
      question: this.currentClue.question,
      id: this.currentClue.id,
      currentScores: this.scoreboard,
    });
    await this.changeGameState(GameState.FinalScores);
    this.timeouts.reset = setTimeout(() => {
      this.changeGameState(GameState.None);
    }, JTiming.minimumShowFinalScoreTime);
  };

  private onFinalScores = async (): Promise<void> => {
    this.emit.toFrontEnd(wsServer.FINAL_SCORES, {
      finalScores: Object.entries(this.scoreboard).sort(
        (p1, p2) => p2[1] - p1[1]
      ),
      message:
        "Thanks for playing! A new game will start soon, type !register to join, or !judge to register as a judge",
    });
  };

  // Game State Machine (must be public to use abstraction);
  public gameStateMachine = {
    [GameState.None]: {
      [GameState.LoadingGame]: this.onLoadingGame,
    },
    [GameState.LoadingGame]: {
      [GameState.Jeopardy]: (): Promise<void> => this.onJeopardy(false),
    },
    [GameState.Jeopardy]: {
      [GameState.DoubleJeopardy]: (): Promise<void> => this.onJeopardy(true),
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
      [ClueState.PromptSelectClue]: this.onPromptSelectClue,
      [ClueState.ClueSelected]: this.onClueSelected,
    },
    [ClueState.ClueSelected]: {
      [ClueState.PromptSelectClue]: this.onPromptSelectClue,
      [ClueState.DisplayClue]: this.onDisplayClue,
      [ClueState.DailyDouble]: this.onDailyDouble,
    },
    [ClueState.DailyDouble]: {
      [ClueState.DisplayClue]: this.onDisplayClue,
    },
    [ClueState.DisplayClue]: {
      [ClueState.DisplayAnswer]: this.onDisplayAnswer,
    },
    [ClueState.DisplayAnswer]: {
      [ClueState.PromptSelectClue]: this.onPromptSelectClue,
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

  public changeGameState = createStateMachine<
    GameState,
    GameManager["gameStateMachine"]
  >(
    this.gameStateMachine,
    () => this.gameState,
    (state: GameState): void => {
      this.gameState = state;
      this.emit.toFrontEnd(wsServer.GAME_STATE_CHANGE, state);
    }
  );

  public changeClueState = createStateMachine<
    ClueState,
    GameManager["clueStateMachine"]
  >(
    this.clueStateMachine,
    () => this.clueState,
    (state: ClueState): void => {
      this.clueState = state;
      this.emit.toFrontEnd(wsServer.CLUE_STATE_CHANGE, state);
    }
  );

  public changeFinalJeopardyState = createStateMachine<
    FinalJeopardyState,
    GameManager["finalJeopardyStateMachine"]
  >(
    this.finalJeopardyStateMachine,
    () => this.finalJeopardyState,
    (state: FinalJeopardyState): void => {
      this.finalJeopardyState = state;
      this.emit.toFrontEnd(wsServer.FINAL_JEOPARDY_STATE_CHANGE, state);
    }
  );

  // WS Event Handlers

  /* on wsClient.START_GAME */
  public handleStartGame = async (): Promise<void> => {
    this.gameStartTime = Date.now() + JTiming.startGame;
    this.emit.toFrontEnd(wsServer.GAME_START_TIME, this.gameStartTime);
    this.emit.toFrontEnd(
      wsServer.INFO,
      `Type !register to register to play. Game will start in 3 minutes`
    );
    await this.changeGameState(GameState.LoadingGame);
  };

  /* on wsClient.REGISTER_PLAYER */
  public handleRegisterPlayer = (playerName: string): void => {
    if (Object.keys(this.scoreboard).length === 0) {
      this.controllingPlayer = playerName;
    }
    if (!this.scoreboard[playerName]) {
      this.scoreboard[playerName] = 0;
      this.emit.toFrontEnd(wsServer.PLAYER_REGISTERED, playerName);
    }
  };

  /* on wsClient.PROVIDE_ANSWER */
  public handleAnswer = async (
    playerName: string,
    provided: string
  ): Promise<void> => {
    if (
      !this.currentClue.isDailyDouble ||
      this.controllingPlayer === playerName
    )
      this.currentPlayerAnswers.push({
        playerName,
        provided,
        evaluated: null,
      });

    if (
      this.currentClue.isDailyDouble &&
      this.controllingPlayer === playerName
    ) {
      return this.changeClueState(ClueState.DisplayAnswer);
    }
  };

  /* on wsClient.PROVIDE_WAGER */
  public handleWager = async (
    playerName: string,
    wager: number
  ): Promise<void> => {
    if (
      [GameState.Jeopardy, GameState.DoubleJeopardy].includes(this.gameState) &&
      this.clueState === ClueState.DailyDouble
    ) {
      if (playerName !== this.controllingPlayer) {
        return;
      }
      const maxWager = Math.max(
        this.gameState === GameState.Jeopardy ? 1000 : 2000,
        this.scoreboard[playerName]
      );
      this.wagers[playerName] = Math.min(wager, maxWager);
      this.emit.toFrontEnd(wsServer.WAGER_RECEIVED, playerName, wager);
      clearTimeout(this.timeouts.wagerTime);
      return this.changeClueState(ClueState.DisplayClue);
    }
    if (this.gameState === GameState.FinalJeopardy) {
      if (this.scoreboard[playerName] <= 0) {
        return;
      }
      this.wagers[playerName] = Math.min(wager, this.scoreboard[playerName]);
      this.emit.toFrontEnd(wsServer.WAGER_RECEIVED, playerName);
    }
  };

  /* on wsClient.SELECT_CLUE */
  public handleSelectClue = ({
    playerName,
    categoryKey,
    value,
  }: {
    playerName: string;
    categoryKey: string;
    value: number;
  }): Promise<void> | void => {
    if (playerName === this.controllingPlayer) {
      clearTimeout(this.timeouts.promptSelectClue);
      const nextClue = [
        get(this.board.lookup, [categoryKey], -1),
        value / (this.gameState === GameState.Jeopardy ? 200 : 400) - 1,
      ];
      return this.changeClueState(ClueState.ClueSelected, nextClue);
    }
  };
}

export default GameManager;
