<template>
  <socket-component />
  <!-- <div>
    <pre>{{ JSON.stringify(store.state, null, 2) }}</pre>
  </div>
  <game-timer />
  <register-player v-if="!store.state.user.connected" @login="handleLogin" />
  <button @click="startGame">Start Game</button>
  <answer-timer /> -->
  <clue-display
    :category="test.category"
    :value="test.value"
    :question="test.question"
  />
  <answer-input />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import RegisterPlayer from "./components/RegisterPlayer.vue";
import GameTimer from "./components/GameTimer.vue";
import socketActions from "./socket/actions";
import SocketComponent from "./socket/SocketComponent.vue";
import AnswerTimer from "./components/AnswerTimer.vue";
import AnswerInput from "./components/AnswerInput.vue";
import ClueDisplay from "./components/ClueDisplay.vue";

export default defineComponent({
  name: "App",
  components: {
    // RegisterPlayer,
    SocketComponent,
    // GameTimer,
    // AnswerTimer,
    AnswerInput,
    ClueDisplay,
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

    return { store, startGame: socketActions.startGame, handleLogin, test };
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
