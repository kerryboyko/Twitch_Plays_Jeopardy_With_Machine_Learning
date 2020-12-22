import { UserState } from "./index";
import { MutationTree } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export const mutations: MutationTree<UserState> = {
  [wsServer.PLAYER_REGISTERED]: (
    state,
    { twitchId, socketId }: { twitchId: string; socketId: string }
  ) => {
    state.socketId = socketId;
    state.twitchId = twitchId;
    state.connected = true;
  },
  disconnect: (state) => {
    state.connected = false;
  },
};

export default mutations;
