import { ChatUserstate } from "tmi.js";

/* eslint-disable camelcase */
export interface JeopardyCategory {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
  clues_count: number;
}

/* Yes, we all know that Jeopardy refers to these as "answers" or "clues" */
export interface JeopardyClue {
  id: number;
  answer: string;
  question: string;
  value: number;
  airdate: string; // '1985-02-08T12:00:00.000Z';
  created_at: string; // '2014-02-11T22:47:18.829Z';
  updated_at: string; // '2014-02-11T22:47:18.829Z';
  category_id: number;
  game_id: null | unknown;
  invalid_count: null | number;
  category: JeopardyCategory;
  isDailyDouble?: boolean;
}

export interface JServiceClueParams {
  value?: number;
  category?: number;
  min_date?: Date;
  max_date?: Date;
  offset?: number;
}

export interface JServiceCategoryParams {
  count?: number;
  offset?: number;
}

export interface CorrectionReport {
  reporter: string; // username of reporter;
  provided: string; // the answer that was provided
  type: string; // typeof report - thinking this might be enum 'NOT_WRONG' | 'NOT_RIGHT' | 'INVALID_CLUE' | 'OUTDATED_CLUE'
  date?: Date;
}

export interface CorrectionsBody {
  id: number; // question id
  corrections: CorrectionReport[]; // [reporter, providedAnswer, typeOfCorrection];
}

export interface ClueCategory {
  category: string;
  clues: (JeopardyClue | null)[];
}

export interface ProvidedAnswers {
  twitchId: string;
  provided: string;
  evaluated: boolean | null;
  wager?: number;
}

export enum GameState {
  None = "None",
  LoadingGame = "LoadingGame",
  Jeopardy = "Jeopardy",
  DoubleJeopardy = "Double Jeopardy",
  FinalJeopardy = "Final Jeopardy",
  FinalScores = "Final Scores",
}

export enum ClueState {
  None = "No Clue Loaded",
  PromptSelectClue = "Prompt Select Clue",
  ClueSelected = "Clue Selected",
  DailyDouble = "Daily Double",
  DisplayClue = "Display Clue",
  DisplayAnswer = "Display Answer",
}

export enum FinalJeopardyState {
  None = "None",
  DisplayFinalCategory = "Display FJ Category",
  DisplayClue = "Display FJ Clue",
  DisplayAnswer = "Display FJ Answer",
}

export enum DailyDoubleState {
  None = "None",
  DisplayClue = "Display DD Clue",
  DisplayAnswer = "Display DD Answer",
}

export type States =
  | GameState
  | ClueState
  | FinalJeopardyState
  | DailyDoubleState;

export type ChatHandler = (
  target: string,
  context: ChatUserstate,
  message: string,
  isSelf: boolean
) => void;
export interface CurrentClue {
  id: number;
  category: string;
  question: string;
  answer?: string;
  value: number;
  indices: [number, number]; // index value on board, stored for convenience.
  isDailyDouble: boolean;
}
export interface StateSnapshot {
  seed: string;
  clueState: ClueState;
  finalJeopardyState: FinalJeopardyState;
  gameState: GameState;
  startTime: number;
  categories: string[];
  board: Record<string, boolean[]>;
  currentClue: Omit<CurrentClue, "answer">;
  controllingPlayer: string;
  scoreboard: Record<string, number>;
}
