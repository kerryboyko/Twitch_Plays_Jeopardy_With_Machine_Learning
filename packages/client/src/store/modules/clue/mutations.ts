import { ClueData, initializeState } from "./index";
import { MutationTree } from "vuex";
import { ClueState, ProvidedAnswers } from "@jeopardai/server/src/types";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export const mutations: MutationTree<ClueData> = {
  [wsServer.CLUE_STATE_CHANGE]: (state, payload: { clueState: ClueState }) => {
    state.clueState = payload.clueState;
  },
  [wsServer.CURRENT_STATUS]: (state: ClueData, payload: Partial<ClueData>) => {
    Object.keys(payload.currentClue).forEach((key: string) => {
      if (state[key]) {
        state[key] = payload[key];
      }
    });
  },
  [wsServer.PROMPT_SELECT_CLUE]: (state, payload: { twitchId: string }) => {
    state.indices = [-1, -1];
    state.promptedForClue = payload.twitchId === state.controllingPlayer;
  },
  [wsServer.DISPLAY_CLUE]: (
    state,
    payload: {
      id: number;
      isDailyDouble: boolean;
      category: string;
      valueIndex: number;
      question: string;
      indices: [number, number];
    }
  ) => {
    state.id = payload.id;
    state.category = payload.category;
    state.valueIndex = payload.valueIndex;
    state.question = payload.question;
    state.isDailyDouble = payload.isDailyDouble;
    state.answer = "";
    state.indices = payload.indices;
    state.answerLocked = false;
  },
  [wsServer.DISPLAY_ANSWER]: (
    state,
    payload: {
      id: number;
      answer: string;
      provided: ProvidedAnswers[];
    }
  ) => {
    state.answer = payload.answer;
    state.provided.correct = payload.provided.filter((p) => p.evaluated);
    state.provided.incorrect = payload.provided.filter((p) => !p.evaluated);
  },
  [wsServer.END_OF_ROUND]: (state) => {
    const clear = initializeState();
    clear.forEach((prop: string) => {
      state[prop] = clear[prop];
    });
  },
  [wsServer.FJ_DISPLAY_CATEGORY]: (state, payload: { category: string }) => {
    state.category = payload.category;
  },
  [wsServer.ANSWER_RECIEVED]: (state) => {
    state.answerLocked = true;
  },
  [wsServer.GET_DD_WAGER]: (
    state,
    payload: { selection: { valueIndex: number; category: string } }
  ) => {
    // these are loaded in early so that the display will be correct.
    state.category = payload.selection.category;
    state.valueIndex = payload.selection.valueIndex;
    state.isDailyDouble = true;
  },
};

export default mutations;
