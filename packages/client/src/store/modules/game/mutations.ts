import { GameData } from "./index";
import { MutationTree } from "vuex";
import { GameState } from "@jeopardai/server/src/types";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export const mutations: MutationTree<GameData> = {
  [wsServer.PLAYER_REGISTERED]: (state, payload: { seed: string }) => {
    state.seed = payload.seed;
  },
  [wsServer.GAME_START_TIME]: (state, payload: { startTime: number }) => {
    state.startTime = payload.startTime;
  },
  [wsServer.GAME_STATE_CHANGE]: (state, payload: { gameState: GameState }) => {
    state.gameState = payload.gameState;
  },
  [wsServer.CURRENT_STATUS]: (
    state,
    payload: {
      seed: string;
      gameState: GameState;
      startTime: number;
      controllingPlayer: string;
      scoreboard: Record<string, number>;
      board: Record<string, boolean[]>;
    }
  ) => {
    state.seed = payload.seed;
    state.gameState = payload.gameState;
    state.startTime = payload.startTime;
    state.controllingPlayer = payload.controllingPlayer;
    state.scoreboard = payload.scoreboard;
  },
  [wsServer.CHANGE_CONTROLLER]: (
    state,
    payload: { controllingPlayer: string }
  ) => {
    state.controllingPlayer = payload.controllingPlayer;
  },
  [wsServer.SEND_CATEGORIES]: (state, payload: { categories: string[] }) => {
    state.categories = payload.categories;
    state.board = state.categories.reduce(
      (pv, category: string) => ({
        ...pv,
        [category]: [true, true, true, true, true],
      }),
      {}
    );
  },
  [wsServer.PROMPT_SELECT_CLUE]: (state, payload: { twitchId: string }) => {
    state.promptedForClue = payload.twitchId === state.controllingPlayer;
  },
  [wsServer.CLUE_SELECTION_TIMEOUT]: (state) => {
    state.promptedForClue = false;
  },
  [wsServer.DISPLAY_CLUE]: (
    state,
    payload: { category: string; valueIndex: number }
  ) => {
    state.promptedForClue = false;
    state.board[payload.category][payload.valueIndex] = false;
  },
  [wsServer.DISPLAY_ANSWER]: (
    state,
    payload: { scoreboard: Record<string, number> }
  ) => {
    state.scoreboard = payload.scoreboard;
  },
};

export default mutations;
