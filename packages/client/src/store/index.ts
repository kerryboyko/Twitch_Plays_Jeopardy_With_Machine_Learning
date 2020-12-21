import { createStore } from "vuex";
import user from "./modules/user";
import game from "./modules/game";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: { user, game },
});
