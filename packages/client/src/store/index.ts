import { createStore } from "vuex";
import user from "./modules/user";
import game from "./modules/game";
import clue from "./modules/clue";
import meta from "./modules/meta";
import { createLogger } from "vuex";

export default createStore({
  plugins: [createLogger()],
  state: {},
  mutations: {},
  actions: {},
  modules: { user, game, clue, meta },
});
