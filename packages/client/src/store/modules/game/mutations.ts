import { GameData } from "./index";
import { MutationTree } from "vuex";
import { FinalJeopardyState, GameState } from "@jeopardai/server/src/types";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export const mutations: MutationTree<GameData> = {
  [wsServer.GAME_STATE_CHANGE]: (state, payload: { gameState: GameState }) => {
    state.gameState = payload.gameState;
  },
  [wsServer.PLAYER_REGISTERED]: (
    state,
    payload: { seed: string; twitchId: string; socketId: string }
  ) => {
    state.seed = payload.seed;
  },
  [wsServer.GAME_START_TIME]: (state, payload: { startTime: number }) => {
    state.startTime = payload.startTime;
  },
  [wsServer.CURRENT_STATUS]: (state: GameData, payload: Partial<GameData>) => {
    Object.keys(payload).forEach((key: string) => {
      if (state[key]) {
        state[key] = payload[key];
      }
    });
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
    state.answerLocked = false;
    state.promptedForWager = false;
    state.promptedForClue = false;
    state.board[payload.category][payload.valueIndex] = false;
  },
  [wsServer.ANSWER_RECIEVED]: (state) => {
    state.answerLocked = true;
  },
  [wsServer.DISPLAY_ANSWER]: (
    state,
    payload: { scoreboard: Record<string, number> }
  ) => {
    state.scoreboard = payload.scoreboard;
    state.wagerLocked = true;
    state.answerLocked = false;
    state.promptedForWager = false;
  },
  [wsServer.GET_DD_WAGER]: (state) => {
    state.promptedForWager = true;
  },
  [wsServer.WAGER_RECEIVED]: (state) => {
    state.wagerLocked = true;
  },
  [wsServer.FJ_DISPLAY_CATEGORY]: (state) => {
    state.promptedForWager = true;
  },
  [wsServer.FJ_DISPLAY_CLUE]: (state) => {
    state.promptedForWager = false;
  },
  [wsServer.FINAL_JEOPARDY_STATE_CHANGE]: (
    state,
    payload: { fjState: FinalJeopardyState }
  ) => {
    state.finalJeopardyState = payload.fjState;
  },
  // [wsServer.FINAL_SCORES]: (state) => {
  //   //TODO: something?
  //   console.log(state);
  // },
};

export default mutations;
