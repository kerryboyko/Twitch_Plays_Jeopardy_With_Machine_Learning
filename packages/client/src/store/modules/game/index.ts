import mutations from "./mutations";
import { GameState } from "@jeopardai/server/src/types";

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
  categories: string[];
  controllingPlayer: string;
  board: Record<string, boolean[]>;
  promptedForClue: boolean;
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
  seed: "",
  info: [],
  gameState: GameState.None,
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
