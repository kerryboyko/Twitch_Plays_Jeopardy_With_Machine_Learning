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
import { defineComponent, reactive, onBeforeMount } from "vue";
import useSocket from "../hooks/useSocket";
export default defineComponent({
  name: "Main",
  setup() {
    const state = reactive<{ responses: string[]; inputField: string }>({
      responses: [],
      inputField: ""
    });
    onBeforeMount(() => {
      useSocket();
    });
    return {
      state
    };
  }
});
</script>
