/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <div class="home">
    <chat-log />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ChatLog from "../components/ChatLog.vue";
export default defineComponent({
  components: { ChatLog },
  name: "Main",
});
</script>
