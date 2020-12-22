import mutations from "./mutations";
import {
  CurrentClue,
  ClueState,
  ProvidedAnswers,
} from "@jeopardai/server/src/types";

export interface ClueData extends CurrentClue {
  clueState: ClueState;
  ownAnswer: string;
  wager: number | null;
  [key: string]: any;
  provided: {
    correct: ProvidedAnswers[];
    incorrect: ProvidedAnswers[];
  };
}

export const initializeState = (): ClueData => ({
  clueState: ClueState.None,
  wager: null,
  ownAnswer: "",
  id: -1,
  category: "",
  question: "",
  answer: "",
  value: 0,
  indices: [-1, -1],
  isDailyDouble: false,
  provided: { correct: [], incorrect: [] },
});

export default {
  namespaced: false,
  state: initializeState(),
  mutations,
  actions: {},
  getters: {},
};
