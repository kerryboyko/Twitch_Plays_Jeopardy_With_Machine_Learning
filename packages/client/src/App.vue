<template>
  <div>
    <pre>{{ JSON.stringify(store.state, null, 2) }}</pre>
  </div>
  <register-player v-if="!store.state.game.seed" @login="handleLogin" />
  <button @click="startGame">Start Game</button>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import RegisterPlayer from "./components/RegisterPlayer.vue";
import socketActions from "./socket/actions";

export default defineComponent({
  name: "App",
  components: { RegisterPlayer },
  setup() {
    const store = useStore();
    const state = reactive<{
      twitchId: string;
      input: string;
    }>({
      twitchId: "",
      input: "",
    });
    const handleLogin = () => {
      if (state.input !== "") {
        state.twitchId = state.input;
        socketActions.registerPlayer(state.twitchId);
      }
    };

    return { store, state, startGame: socketActions.startGame, handleLogin };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
