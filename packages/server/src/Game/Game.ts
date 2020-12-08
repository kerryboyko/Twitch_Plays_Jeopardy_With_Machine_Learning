import randomSeed, { RandomSeed } from "random-seed";
// import getDailyDoubles from "./getDailyDoubles";
import { isInteger, pick } from "lodash";
import getClues from "../db/services/getClues";
import createBoard from "./utils/createBoard";
import { MINUTE } from "./utils/constants";
import { JeopardyClue, ClueCategory } from "../types";
import { wsServer } from "../sockets/commands";
import genSeedString from "./utils/genSeedString";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeEmit = (...stuff: any[]) => console.log(...stuff);

enum GameState {
  None = "None",
  LoadingGame = "LoadingGame",
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
  private rand: RandomSeed;

  private gameState = GameState.None;

  private clueState = ClueState.NoClue;

  private gameStartTime = 0;

  private timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

  private clues: ClueCategory[] = [];

  private dailyDoubles: [number, number][] = [];

  private board: {
    clueSet: ClueCategory[];
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

  constructor(public seed: string = genSeedString()) {
    this.rand = randomSeed.create(seed);
    this.changeGameState(GameState.LoadingGame);
  }

  private valuesToIndexes = (key: string, value: number): [number, number] => [this.board.lookup[key], value / (this.gameState === GameState.DoubleJeopardy ? 400 : 200)]

  // used to grab the next clue automatically
  // as well as check to see if we should go to next round. 
  private nextClue = (): [number, number] | null => {
    for (let cat = 0, catL = this.board.clueSet.length; cat < catL; cat++){
      for(let cluIndex = 0, cluL = this.board.clueSet[cat].clues.length; cluIndex < cluL; cluIndex++){
        if(this.board.clueSet[cat].clues[cluIndex] !== null){
          return [cat, cluIndex]
        }
      }
    }
    return null;
  };

  public registerPlayer = (playerName: string): void => {
    if (!this.scoreboard[playerName]) {
      this.scoreboard[playerName] = 0;
    }
  };

  private onLoadingGame = async (): Promise<void> => {
    this.gameStartTime = Date.now() + 3 * MINUTE;
    fakeEmit(wsServer.GAME_START_TIME, this.gameStartTime);
    fakeEmit(
      wsServer.INFO,
      `Type !register to register to play. Game will start in 3 minutes`
    );
    const clues = await getClues.fullBoard(this.rand);
    this.clues = clues;
    this.board = createBoard(this.clues.slice(0, 6), this.rand, false);
    this.timeouts.jeopardy = setTimeout(() => {
      this.changeGameState(GameState.Jeopardy);
    }, 3 * MINUTE);
  };

  private onJeopardy = (): void => {
    // we may run this early, so we clear the timeout if we haven't already.
    clearTimeout(this.timeouts.jeopardy);
    fakeEmit(
      wsServer.SEND_CATEGORIES,
      this.board.clueSet.map((clueCategory: ClueCategory) => [
        clueCategory.key,
        clueCategory.category,
      ])
    );
    const players = Object.keys(this.scoreboard);
    this.controllingPlayer =
      players[Math.floor(Math.random() * players.length)];
    fakeEmit(wsServer.CHANGE_CONTROLLER, {
      controllingPlayer: this.controllingPlayer,
      message: `We flipped a coin to determine who will go first, and so we'll start with ${this.controllingPlayer}`,
    });
    this.changeClueState(ClueState.SelectClue);
  };

  private changeGameState = (gameState: GameState): void => {
    this.gameState = gameState;
    fakeEmit(wsServer.GAME_STATE_CHANGE, gameState);
    const handlers = {
      [GameState.LoadingGame]: this.onLoadingGame,
      [GameState.Jeopardy]: this.onJeopardy,
      [GameState.DoubleJeopardy]: this.onDoubleJeopardy,
      [GameState.FinalJeopardy]: this.onFinalJeopardy,
      [GameState.FinalScores]: this.onFinalScores,
    };
    handlers[gameState]();
  };

  /* Same - put emits in here.  */
  private changeClueState = (clueState: ClueState): void => {
    this.clueState = clueState;
    fakeEmit(wsServer.CLUE_STATE_CHANGE, clueState);
    const handlers = {
      [ClueState.SelectClue]: this.onPromptSelectClue,
      [ClueState.DisplayClue]: this.onDisplayClue,
      [ClueState.DisplayAnswer]: this.onDisplayAnswer,
      [ClueState.NoClue]: this.onNoClue,
    }
    handlers[clueState]()
  }

  private onPromptSelectClue = () => {
    fakeEmit(
      wsServer.SelectClue,
      `${this.controllingPlayer}, you have control of the board, select a category.`
    );

    this.timeouts.selectClue = setTimeout(() => {
      const nextClue = this.nextClue() as [number, number];
      fakeEmit(
        wsServer.NoClueSelectionResponse,
        `No response: Selecting next clue automatically`
      );
      this.onClueSelected(nextClue);
    }, MINUTE)
  }

  public onClueSelected = ([categoryIndex, valueIndex]: [number, number]):void => {
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
      value: (valueIndex + 1) * (this.gameState === GameState.DoubleJeopardy ? 400 : 200),
      indices: [categoryIndex, valueIndex],
    };
    // probably want to emit on setting the current clue.
    this.changeClueState(ClueState.DisplayClue);
  }
  
}

export default Game;
