<template>
  <socket-component />
  <game-clock />

  <register-player v-if="!store.state.user.connected" @login="handleLogin" />

  <game-board :isDoubleJeopardy="false" />
  <clue-display />
  <answer-input />
  <div>
    <pre>{{ JSON.stringify(store.state, null, 2) }}</pre>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import RegisterPlayer from "./components/RegisterPlayer.vue";
import socketActions from "./socket/actions";
import SocketComponent from "./socket/SocketComponent.vue";
import AnswerInput from "./components/AnswerInput.vue";
import ClueDisplay from "./components/ClueDisplay.vue";
import GameBoard from "./components/GameBoard.vue";
import GameClock from "./components/GameClock.vue";

export default defineComponent({
  name: "App",
  components: {
    RegisterPlayer,
    SocketComponent,
    AnswerInput,
    ClueDisplay,
    GameBoard,
    GameClock,
  },
  setup() {
    const store = useStore();
    const test = {
      question:
        "Dexy's Midnight Runners No. 1 hit heard here in a version by ska band Save Ferris:",
      value: 800,
      category: "under the covers",
    };
    const handleLogin = (twitchId: string) => {
      if (twitchId !== "") {
        socketActions.registerPlayer(twitchId);
      }
    };

    return {
      store,
      handleLogin,
      test,
    };
  },
});
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:ital,wght@0,400;0,600;1,400;1,600&display=swap");
@font-face {
  font-family: "Korinna";
  src: url("/fonts/OPTIKorinna-Agency.ttf.woff") format("woff"); /* Pretty Modern Browsers */
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
}
pre {
  margin: 0;
  padding: 10;
}
$jeopardy-blue: #2c3e50;
#app {
  font-family: Poppins, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: $jeopardy-blue;
  color: white;
  margin: 0;
  padding: 0;
}
</style>
