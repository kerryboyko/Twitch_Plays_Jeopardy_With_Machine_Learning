import { createStore } from "vuex";
import user from "./modules/user";
import game from "./modules/game";
import { createLogger } from "vuex";

export default createStore({
  plugins: [createLogger()],
  state: {},
  mutations: {},
  actions: {},
  modules: { user, game },
});
