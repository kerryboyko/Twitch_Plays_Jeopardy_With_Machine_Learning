/* eslint-disable @typescript-eslint/no-explicit-any */
import randomSeed, { RandomSeed } from "random-seed";
import pick from "lodash/pick";
import get from "lodash/get";
import omit from "lodash/omit";
import { Server } from "socket.io";
import getClues from "../db/services/getClues";
import { JTiming } from "./utils/constants";
import genSeedString from "./utils/genSeedString";
import getNextClue from "./utils/getNextClue";
import pickOneAtRandom from "./utils/pickOneAtRandom";
import checkLiveClues from "./utils/checkLiveClues";
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
  StateSnapshot,
  CurrentClue,
} from "../types";
import getDailyDoubles from "./utils/getDailyDoubles";

/* TODO: This is a refactor target.  What we PROBABLY should be doing is having four seperate classes:
   Game / Board / Clue / Final Jeopardy.  */

class GameManager {
  public gameState: GameState = GameState.None;

  public clueState: ClueState = ClueState.None;

  public finalJeopardyState: FinalJeopardyState = FinalJeopardyState.None;

  public seed = "";

  public rand: RandomSeed = randomSeed.create();

  public gameStartTime = 0;

  public timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

  // we grab this once from the DB, then it's read-only.
  public clues: ClueCategory[] = [];

  // this is the live board which is mutable
  public board: ClueCategory[] = [];

  // probably should make it's own class, no?
  public currentClue: CurrentClue = {
    id: -1,
    category: "",
    question: "",
    answer: "",
    value: 0, // usually determined by indices, but not in the case of daily double or final jeopardy
    valueIndex: -1,
    indices: [-1, -1],
    isDailyDouble: false,
  };

  public controllingPlayer = ""; // player has control of the board. Only the controlling player can play a Daily Double.

  // key: player name, value: socket ID
  public players: Record<string, string> = {};

  public scoreboard: Record<string, number> = {};

  public wagers: Record<string, number> = {};

  public currentPlayerAnswers: ProvidedAnswers[] = [];

  public clients: Record<string, string> = {};

  // getters?
  public getClient = (twitchId: string): string => this.clients[twitchId];

  private io: Server | undefined;

  public setIo = (io: Server): void => {
    this.io = io;
  };

  /* NO CONSTRUCTOR! */

  public grabCurrentStatus = (): StateSnapshot => {
    return {
      seed: this.seed,
      clueState: this.clueState,
      finalJeopardyState: this.finalJeopardyState,
      gameState: this.gameState,
      startTime: this.gameStartTime,
      currentClue: omit(this.currentClue, "answer"),
      controllingPlayer: this.controllingPlayer,
      categories: this.board.map((cc: ClueCategory) => cc.category),
      board: checkLiveClues(this.board),
      scoreboard: this.scoreboard,
    };
  };

  public getSeed = (): string => this.seed;

  // used to grab the next clue automatically
  // as well as check to see if we should go to next round.
  public getNextClue = (): [string, number] | null => getNextClue(this.board);

  public isGameRunning = (): boolean => {
    return ![GameState.None, GameState.FinalScores].includes(this.gameState);
  };

  public startGame = async (seed = genSeedString()): Promise<void> => {
    const debugInterval = setInterval(() => {
      this.debugEmitter();
    }, 30000);
    setTimeout(() => {
      clearInterval(debugInterval);
    }, 600000);
    this.seed = seed;
    this.rand = randomSeed.create(seed);
    this.gameStartTime = Date.now() + JTiming.startGame;
    await this.changeGameState(GameState.LoadingGame);
  };

  // GAME STATE HANDLERS
  public onLoadingGame = async (): Promise<void> => {
    const clues = await getClues.fullBoard(this.rand);
    this.clues = clues;
    this.timeouts.gameLoaded = setTimeout(() => {
      this.changeGameState(GameState.Jeopardy);
    }, JTiming.startGame);
  };

  public onJeopardy = async (isDoubleJeopardy: boolean): Promise<void> => {
    // we may run this early, so we clear the timeout if we haven't already.
    clearTimeout(this.timeouts.gameLoaded);
    // create board
    this.board = this.clues.slice(...(isDoubleJeopardy ? [0, 6] : [6, 12]));
    getDailyDoubles(this.rand, isDoubleJeopardy).forEach(([cat, val]) => {
      if (this.board[cat].clues[val] !== null) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.board[cat].clues[val]!.isDailyDouble = true;
      }
    });
    this.io?.emit(wsServer.SEND_CATEGORIES, {
      categories: this.board.map(
        (clueCategory: ClueCategory) => clueCategory.category
      ),
    });
    if (!isDoubleJeopardy) {
      this.controllingPlayer = pickOneAtRandom(Object.keys(this.scoreboard));
    } else {
      for (const player in this.scoreboard) {
        if (this.scoreboard[player] < this.scoreboard[this.controllingPlayer]) {
          this.controllingPlayer = player;
        }
      }
    }
    this.io?.emit(wsServer.CHANGE_CONTROLLER, {
      controllingPlayer: this.controllingPlayer,
    });
    await this.changeClueState(ClueState.PromptSelectClue);
  };

  public advanceRound = async (): Promise<void> | never => {
    if (this.gameState === GameState.Jeopardy) {
      this.io?.emit(
        wsServer.END_OF_ROUND,
        `And that is the end of our first Jeopardy round`
      );

      await this.changeGameState(GameState.DoubleJeopardy);
    } else if (this.gameState === GameState.DoubleJeopardy) {
      this.io?.emit(
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

  public onPromptSelectClue = async (): Promise<void> => {
    // clear answers & wagers
    this.currentPlayerAnswers = [] as ProvidedAnswers[];
    this.wagers = {};
    const nextClue = this.getNextClue();
    // check if we should advance to the next round.
    if (nextClue === null) {
      return this.advanceRound(); // abort, advance
    }
    this.io
      ?.to(this.getClient(this.controllingPlayer))
      .emit(wsServer.PROMPT_SELECT_CLUE, { twitchId: this.controllingPlayer });

    this.timeouts.promptSelectClue = setTimeout(() => {
      console.log("TIMED OUT");
      this.io?.emit(wsServer.CLUE_SELECTION_TIMEOUT, {
        twitchId: this.controllingPlayer,
      });
      const [nextCategory, nextValue] = nextClue;
      this.changeClueState(ClueState.ClueSelected, {
        timeout: true,
        category: nextCategory,
        valueIndex: nextValue,
        twitchId: this.controllingPlayer,
      });
    }, JTiming.selectTime);
  };

  public onClueSelected = async (payload: {
    twitchId?: string;
    timeout?: boolean;
    category: string;
    valueIndex: number; // index valueIndex;
  }): Promise<void> => {
    console.log(payload);
    if (payload.twitchId !== this.controllingPlayer) {
      return;
    }
    const categoryIndex = this.board.findIndex(
      (catSet: ClueCategory) => catSet.category === payload.category
    );

    // bad clue
    if (
      categoryIndex === -1 ||
      payload.valueIndex < 0 ||
      payload.valueIndex > 4 ||
      get(this.board, [categoryIndex, "clues", payload.valueIndex], null) ===
        null
    ) {
      console.log("bad clue");
      clearTimeout(this.timeouts.promptSelectClue);
      this.io
        ?.to(this.getClient(this.controllingPlayer))
        .emit(wsServer.INVALID_CLUE_SELECTION);
      return this.changeClueState(ClueState.PromptSelectClue);
    }

    // good clue.
    const { question, answer, category, isDailyDouble, id } = pick(
      this.board[categoryIndex].clues[payload.valueIndex],
      ["question", "answer", "category", "isDailyDouble", "id"]
    );
    this.currentClue = {
      id: id as number,
      category: category?.title as string,
      question: question as string,
      answer: answer as string,
      value:
        (payload.valueIndex + 1) *
        (this.gameState === GameState.DoubleJeopardy ? 400 : 200),
      valueIndex: payload.valueIndex,
      indices: [categoryIndex, payload.valueIndex],
      isDailyDouble: isDailyDouble || false,
    };
    if (this.currentClue.isDailyDouble) {
      await this.changeClueState(ClueState.DailyDouble);
    } else {
      // probably want to emit on setting the current clue.
      await this.changeClueState(ClueState.DisplayClue);
    }
  };

  public onDisplayClue = (): void => {
    clearTimeout(this.timeouts.wagerTime); // for DDs and FJ
    this.io?.emit(wsServer.DISPLAY_CLUE, {
      question: this.currentClue.question,
      id: this.currentClue.id,
      value: this.currentClue.value,
      category: this.currentClue.category,
      board: checkLiveClues(this.board),
      indices: this.currentClue.indices,
      isDailyDouble: this.currentClue.isDailyDouble,
      valueIndex:
        this.currentClue.value /
          (this.gameState === GameState.DoubleJeopardy ? 400 : 200) -
        1,
    });
    this.timeouts.answerTime = setTimeout(() => {
      this.changeClueState(ClueState.DisplayAnswer);
    }, JTiming.answerTime);
  };

  public onDailyDouble = (): void => {
    this.io?.emit(wsServer.GET_DD_WAGER, {
      player: this.controllingPlayer,
      maxWager: Math.max(
        this.gameState === GameState.Jeopardy ? 1000 : 2000,
        this.scoreboard[this.controllingPlayer]
      ),
      selection: {
        valueIndex:
          this.currentClue.value /
            (this.gameState === GameState.DoubleJeopardy ? 400 : 200) -
          1,
        category: this.currentClue.category,
      },
    });
    this.timeouts.wagerTime = setTimeout(() => {
      this.changeClueState(ClueState.DisplayClue);
    }, JTiming.wagerTime);
  };

  public onDisplayAnswer = async (): Promise<void> => {
    clearTimeout(this.timeouts.answerTime);
    // judge recieved answers
    await Promise.all(
      this.currentPlayerAnswers.map(
        async ({ twitchId, provided }, index: number) => {
          const { final } = await answerEvaluator(
            this.currentClue.answer as string,
            provided
          );
          const value =
            this.gameState === GameState.FinalJeopardy ||
            this.currentClue.isDailyDouble
              ? this.wagers[twitchId]
              : this.currentClue.value;
          this.currentPlayerAnswers[index].evaluated = final;
          // adjust scores
          if (final !== null) {
            this.scoreboard[twitchId] += value * (final ? 1 : -1);
          }
        }
      )
    );
    // find first player to answer correctly.
    const controlAnswer = this.currentPlayerAnswers.find(
      ({ evaluated }) => evaluated === true
    );
    if (controlAnswer !== undefined) {
      this.controllingPlayer = controlAnswer.twitchId;
    }
    // TODO: We may want to push the results to memory here,
    // or even store in the DB.

    // nullify the question;
    const [cat, val] = this.currentClue.indices;
    this.board[cat].clues[val] = null;

    // display the results
    this.io?.emit(wsServer.DISPLAY_ANSWER, {
      answer: this.currentClue.answer,
      provided: this.currentPlayerAnswers,
      question: this.currentClue.question,
      id: this.currentClue.id,
      valueIndex: this.currentClue.value,
      scoreboard: this.scoreboard,
      board: checkLiveClues(this.board),
    });

    // clear answers and wagers;

    this.timeouts.afterAnswer = setTimeout(() => {
      this.changeClueState(ClueState.PromptSelectClue);
    }, JTiming.afterAnswer);
  };

  // final jeopardy state handlers

  public onFinalJeopardy = async (): Promise<void> => {
    const fjCategory = this.clues[12].category;
    const fjClue = this.clues[12].clues[4] as JeopardyClue; // most difficult question in the last category.
    this.currentClue = {
      id: fjClue.id as number,
      question: fjClue.question as string,
      answer: fjClue.answer as string,
      value: 0,
      valueIndex: 4,
      isDailyDouble: false,
      indices: [-1, -1],
      category: fjCategory,
    };
    await this.changeFinalJeopardyState(
      FinalJeopardyState.DisplayFinalCategory
    );
  };

  public onDisplayFinalCategory = (): void => {
    this.io?.emit(wsServer.FJ_DISPLAY_CATEGORY, {
      category: this.currentClue.category,
    });
    this.timeouts.finalJeopardyWager = setTimeout(() => {
      this.changeFinalJeopardyState(FinalJeopardyState.DisplayClue);
    }, JTiming.wagerTime);
  };

  public onDisplayFinalClue = (): void => {
    clearTimeout(this.timeouts.wagerTime); // for DDs and FJ
    this.io?.emit(wsServer.FJ_DISPLAY_CLUE, {
      category: this.currentClue.category,
      question: this.currentClue.question,
      id: this.currentClue.id,
    });
    this.io?.emit(wsServer.PLAY_THINK_MUSIC);
    this.timeouts.answerTime = setTimeout(() => {
      this.changeClueState(ClueState.DisplayAnswer);
    }, JTiming.answerTime);
  };

  public onDisplayFinalAnswer = async (): Promise<void> => {
    clearTimeout(this.timeouts.answerTime);
    // judge recieved answers

    await Promise.all(
      this.currentPlayerAnswers.map(
        async ({ twitchId, provided }, index: number) => {
          const wager = this.wagers[twitchId];
          if (wager === undefined || wager < 0) {
            return;
          }
          const { final } = await answerEvaluator(
            this.currentClue.answer as string,
            provided
          );
          this.currentPlayerAnswers[index].evaluated = final;

          // adjust scores
          if (final !== null && wager > 0) {
            this.scoreboard[twitchId] += wager * (final ? 1 : -1);
          }
        }
      )
    );

    // TODO: We may want to push the results to memory here,
    // or even store in the DB.

    // display the results
    this.io?.emit(wsServer.DISPLAY_ANSWER, {
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

  public onFinalScores = async (): Promise<void> => {
    this.io?.emit(wsServer.FINAL_SCORES);
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
      this.io?.emit(wsServer.GAME_STATE_CHANGE, { gameState: state });
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
      this.io?.emit(wsServer.CLUE_STATE_CHANGE, { clueState: state });
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
      this.io?.emit(wsServer.FINAL_JEOPARDY_STATE_CHANGE, { fjState: state });
    }
  );

  // WS Event Handlers

  /* on wsClient.REGISTER_PLAYER */
  public handleRegisterPlayer = async (
    twitchId: string,
    socketId: string
  ): Promise<void> => {
    if (Object.keys(this.scoreboard).length === 0) {
      this.controllingPlayer = twitchId;
    }
    this.players[twitchId] = socketId;
    if (!this.scoreboard[twitchId]) {
      this.scoreboard[twitchId] = 0;
    }
    console.log(`Registering ${twitchId} to ${this.players[twitchId]}`);
  };

  /* on wsClient.PROVIDE_ANSWER */
  public handleAnswer = async (payload: {
    twitchId: string;
    provided: string;
  }): Promise<void> => {
    if (this.currentClue.isDailyDouble) {
      if (payload.twitchId === this.controllingPlayer) {
        this.currentPlayerAnswers = [
          {
            ...payload,
            evaluated: null,
          },
        ];
        this.io
          ?.to(this.players[payload.twitchId])
          .emit(wsServer.ANSWER_RECIEVED);
        return this.changeClueState(ClueState.DisplayAnswer);
      }
    } else {
      this.currentPlayerAnswers.push({
        ...payload,
        evaluated: null,
      });
      console.log(this.currentPlayerAnswers);
      this.io
        ?.to(this.players[payload.twitchId])
        .emit(wsServer.ANSWER_RECIEVED);
    }
  };

  /* on wsClient.PROVIDE_WAGER */
  public handleWager = async (payload: {
    twitchId: string;
    wager: number;
  }): Promise<void> => {
    if (
      [GameState.Jeopardy, GameState.DoubleJeopardy].includes(this.gameState) &&
      this.clueState === ClueState.DailyDouble
    ) {
      if (payload.twitchId !== this.controllingPlayer) {
        return;
      }
      const maxWager = Math.max(
        this.gameState === GameState.Jeopardy ? 1000 : 2000,
        this.scoreboard[payload.twitchId]
      );
      this.wagers[payload.twitchId] = Math.min(payload.wager, maxWager);
      this.io?.emit(wsServer.WAGER_RECEIVED, payload.twitchId, payload.wager);
      clearTimeout(this.timeouts.wagerTime);
      return this.changeClueState(ClueState.DisplayClue);
    }
    if (this.gameState === GameState.FinalJeopardy) {
      if (this.scoreboard[payload.twitchId] <= 0) {
        return;
      }
      this.wagers[payload.twitchId] = Math.min(
        payload.wager,
        this.scoreboard[payload.twitchId]
      );
      this.io
        ?.to(this.players[payload.twitchId])
        .emit(wsServer.WAGER_RECEIVED, {
          twitchId: payload.twitchId,
          wager: this.wagers[payload.twitchId],
        });
    }
  };

  /* on wsClient.SELECT_CLUE */
  public handleSelectClue = (payload: {
    twitchId: string;
    category: string;
    valueIndex: number;
  }): Promise<void> | void => {
    console.log("HANDLING SELECT CLUE", payload);
    if (payload.twitchId === this.controllingPlayer) {
      clearTimeout(this.timeouts.promptSelectClue);
      return this.changeClueState(ClueState.ClueSelected, payload);
    }
  };

  /* DEBUG HANDLER!!!! */
  public debugHandler = async (...payload: any[]): Promise<void> => {
    // ALL_DAILY_DOUBLES
    console.log({ payload });
    if (payload[0] === "ALL_DAILY_DOUBLES") {
      if (this.board.length) {
        console.log("changing all to daily double");
      }
      for (const clueCategory of this.board) {
        for (const clue of clueCategory.clues) {
          if (clue !== null) {
            clue.isDailyDouble = true;
          }
        }
      }
    }
  };

  /* DEBUG EMITTER!!! */
  public debugEmitter = (): void => {
    this.io?.emit(
      wsServer.BACKEND_GAME_STATE,
      pick(this, [
        "seed",
        "clueState",
        "finalJeopardyState",
        "board",
        "gameState",
        "currentClue",
        "currentPlayerAnswers",
        "controllingPlayer",
        "scoreboard",
        "wagers",
        "clients",
        "gameStartTime",
      ])
    );
  };
}

export default GameManager;
