import { ClueData, initializeState } from "./index";
import { MutationTree } from "vuex";
import { ClueState, ProvidedAnswers } from "@jeopardai/server/src/types";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

/* factoring out for clarity */
const processClueStateChange = (_state: ClueData, clueState: ClueState) => {
  console.log(clueState);
};

export const mutations: MutationTree<ClueData> = {
  [wsServer.CURRENT_STATUS]: (state: ClueData, payload: Partial<ClueData>) => {
    Object.keys(payload.currentClue).forEach((key: string) => {
      if (state[key]) {
        state[key] = payload[key];
      }
    });
  },
  [wsServer.DISPLAY_CLUE]: (
    state,
    payload: {
      isDailyDouble: boolean;
      category: string;
      value: number;
      question: string;
    }
  ) => {
    state.category = payload.category;
    state.value = payload.value;
    state.question = payload.question;
    state.isDailyDouble = payload.isDailyDouble;
    state.answer = "";
  },
  [wsServer.DISPLAY_ANSWER]: (
    state,
    payload: {
      answer: string;
      provided: ProvidedAnswers[];
    }
  ) => {
    state.answer = payload.answer;
    state.provided.correct = payload.provided.filter((p) => p.evaluated);
    state.provided.incorrect = payload.provided.filter((p) => !p.evaluated);
  },
  [wsServer.CLUE_STATE_CHANGE]: (state, clueState: ClueState) => {
    processClueStateChange(state, clueState);
  },
};

export default mutations;
