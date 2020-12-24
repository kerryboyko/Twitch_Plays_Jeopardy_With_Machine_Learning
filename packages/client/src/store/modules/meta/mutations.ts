import { MetaData } from "./index";
import { MutationTree } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";
import { ProvidedAnswers } from "@jeopardai/server/src/types";

export const mutations: MutationTree<MetaData> = {
  [wsServer.DISPLAY_ANSWER]: (
    state: MetaData,
    payload: {
      id: number;
      answer: string;
      provided: ProvidedAnswers[];
    }
  ) => {
    const sortedProvided = {
      correct: payload.provided.filter((p) => p.evaluated),
      incorrect: payload.provided.filter((p) => !p.evaluated),
    };
    state.answerMarks.push({ ...payload, provided: sortedProvided });
  },
};

export default mutations;
