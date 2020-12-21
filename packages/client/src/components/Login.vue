<template>
  <div class="hello">
    <div><input v-model="state.name" type="text" /></div>
    <div><button @click="handleLogin">Login</button></div>
    <div>
      <pre>{{ JSON.stringify(store.state, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";
import { io, Socket } from "socket.io-client";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: String,
  },
  setup() {
    const store = useStore();
    const state = reactive<{ name: string; loggedIn: boolean }>({
      name: "",
      loggedIn: false,
    });
    const handleLogin = () => {
      if (state.name !== "") {
        const socket: Socket = io("http://localhost:4000", {
          query: `twitchId=${state.name}`,
        });
        socket.on("connect", () => {
          console.log(`connected: ${state.name}, ${socket.id}`);
        });
        socket.on(wsServer.CONNECTION_CONFIRMED, () => {
          console.log("and confirmed");
        });
      }
    };
    return { state, handleLogin, store };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
