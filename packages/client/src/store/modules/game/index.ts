import mutations from "./mutations";
import { FinalJeopardyState, GameState } from "@jeopardai/server/src/types";

// export interface Clue {
//   category?: string;
//   question?: string;
//   value?: number;
//   answer?: string;
//   isFJ?: boolean;
//   [key: string]: any;
// }

export interface GameData {
  startTime: number;
  info: string[];
  seed: string;
  gameState: GameState;
  finalJeopardyState: FinalJeopardyState;
  categories: string[];
  controllingPlayer: string;
  board: Record<string, boolean[]>;
  promptedForClue: boolean;
  promptedForWager: boolean;
  finalResults: {
    placement?: number;
    outOf?: number;
    finalScore?: number;
  };
  scoreboard: Record<string, number>;
  [key: string]: any;
}

const initializeState = (): GameData => ({
  startTime: 0,
  board: {},
  promptedForClue: false,
  promptedForWager: false,
  seed: "",
  info: [],
  gameState: GameState.None,
  finalJeopardyState: FinalJeopardyState.None,
  categories: [],
  controllingPlayer: "",
  scoreboard: {},
  finalResults: {},
});

export default {
  namespaced: false,
  state: initializeState(),
  mutations,
  actions: {},
  getters: {},
};
