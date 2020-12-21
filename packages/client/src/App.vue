<template>
  <div>
    <pre>{{ JSON.stringify(store.state, null, 2) }}</pre>
  </div>
  <div v-if="state.twitchId === ''">
    <input type="text" v-model="state.input" /><button @click="handleLogin">
      Login
    </button>
  </div>
  <socket v-if="state.twitchId !== ''" :twitchId="state.twitchId" />
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import Socket from "./components/Socket";

export default defineComponent({
  name: "App",
  components: {
    Socket,
  },
  setup() {
    const state = reactive<{ twitchId: string; input: string }>({
      twitchId: "",
      input: "",
    });
    const store = useStore();
    const handleLogin = () => {
      state.twitchId = state.input;
    };
    return { store, state, handleLogin };
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
