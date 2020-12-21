import mutations from "./mutations";
export interface UserState {
  twitchId: string;
  socketId: string;
  connected: boolean;
}

const initializeState = (): UserState => ({
  twitchId: "",
  socketId: "",
  connected: false,
});

export default {
  namespaced: false,
  state: initializeState(),
  mutations,
  actions: {},
  getters: {},
};
