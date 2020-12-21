import { UserState } from "./index";
import { MutationTree } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export const mutations: MutationTree<UserState> = {
  [wsServer.CONNECTION_CONFIRMED]: (state, payload) => {
    state.socketId = payload.socketId;
    state.twitchId = payload.twitchId;
    state.connected = true;
  },
  disconnect: (state) => {
    state.connected = false;
  },
};

export default mutations;
