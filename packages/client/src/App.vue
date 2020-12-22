<template>
  <socket-component />
  <div>
    <pre>{{ JSON.stringify(store.state, null, 2) }}</pre>
  </div>
  <game-timer />
  <register-player v-if="!store.state.user.connected" @login="handleLogin" />
  <button @click="startGame">Start Game</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import RegisterPlayer from "./components/RegisterPlayer.vue";
import GameTimer from "./components/GameTimer.vue";
import socketActions from "./socket/actions";
import SocketComponent from "./socket/SocketComponent.vue";

export default defineComponent({
  name: "App",
  components: { RegisterPlayer, SocketComponent, GameTimer },
  setup() {
    const store = useStore();

    const handleLogin = (twitchId: string) => {
      if (twitchId !== "") {
        socketActions.registerPlayer(twitchId);
      }
    };

    return { store, startGame: socketActions.startGame, handleLogin };
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
