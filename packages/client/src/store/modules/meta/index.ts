import mutations from "./mutations";
import { ProvidedAnswers } from "@jeopardai/server/src/types";

export interface MarkedAnswers extends ProvidedAnswers {
  flags?: number;
}

export interface ResponseRecord {
  id: number;
  answer: string;
  provided: {
    correct: MarkedAnswers[];
    incorrect: MarkedAnswers[];
  };
}

export interface MetaData {
  answerMarks: ResponseRecord[];
}

export const initializeState = (): MetaData => ({
  answerMarks: [],
});

export default {
  namespaced: false,
  state: initializeState(),
  mutations,
  actions: {},
  getters: {},
};
