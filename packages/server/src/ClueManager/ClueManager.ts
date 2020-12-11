import GameManager from "../GameManager";
import { fakeEmit } from "../GameManager/GameManager";
import getNextClue from "../GameManager/utils/getNextClue";
import createStateMachine from "../logic/createStateMachine";
import { wsServer } from "../sockets/commands";
import { ClueState, ClueCategory, ProvidedAnswers } from "../types";

class Clue {
  private clueState: ClueState = ClueState.None;

  private clues: ClueCategory[] = [];

  // this is the live board which is mutable
  private board: {
    clueSet: ClueCategory[];
    lookup: Record<string, number>;
  } = { clueSet: [], lookup: {} };

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

  constructor(
    private game: GameManager,
    public fakeEmit: (...args: any[]) => void
  ) {}

  private getNextClue = (): [number, number] | null =>
    getNextClue(this.board.clueSet);

  public handleAnswer = async (
    playerName: string,
    provided: string
  ): Promise<void> => {
    if (
      !this.currentClue.isDailyDouble ||
      this.game.controllingPlayer === playerName
    )
      this.currentPlayerAnswers.push({
        playerName,
        provided,
        evaluated: null,
      });

    if (
      this.currentClue.isDailyDouble &&
      this.game.controllingPlayer === playerName
    ) {
      return this.changeClueState(ClueState.DisplayAnswer);
    }
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

  public changeClueState = createStateMachine<
    ClueState,
    GameManager["clueStateMachine"]
  >(
    this.clueStateMachine,
    () => this.clueState,
    (state: ClueState): void => {
      this.clueState = state;
      fakeEmit(wsServer.CLUE_STATE_CHANGE, state);
    }
  );
}
export default Clue;
