<template>
  <div>Testing SocketIO Client</div>
  <div>
    <input type="text" v-model="state.inputField" />
    <button @click="sendMessage">Send Message</button>
    <div>
      <ul>
        <li v-for="response in state.responses" :key="response">
          {{ response }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { io, Socket } from "socket.io-client";
import { defineComponent, onMounted, reactive } from "vue";

const socket: Socket = io("http://localhost:8000");

export default defineComponent({
  name: "Main",
  setup() {
    const state = reactive<{ responses: string[]; inputField: string }>({
      responses: [],
      inputField: "",
    });
    socket.on("message", (msg: string) => {
      console.log("msg:", msg);
      state.responses.push(msg);
    });
    socket.on("connected", () => {
      console.log("connected");
    });
    const sendMessage = () => {
      socket.emit("message", state.inputField);
    };
    return {
      state,
      sendMessage,
    };
  },
});
</script>