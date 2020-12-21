import { UserState } from "./index";
import { MutationTree } from "vuex";

export const mutations: MutationTree<UserState> = {
  CONNECTION_CONFIRMED: (state, payload) => {
    state.socketId = payload.socketId;
    state.twitchId = payload.twitchId;
    state.connected = true;
  },
  disconnect: (state) => {
    state.connected = false;
  },
};

export default mutations;
