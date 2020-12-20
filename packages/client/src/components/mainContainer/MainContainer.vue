<template>
  <div class="main-container">
    <pre>
      twitchId: {{ twitchId }}
      socketConnected: {{ socketConnected }}
      socketLoaded: {{ socketLoaded }}
    </pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import useSocket, { SocketHook } from "../../hooks/useSocket";

export default defineComponent({
  name: "Login",
  props: {
    twitchId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const {
      game,
      socketLoaded,
      socketConnected,
      error,
      connectSocket,
      isPlayerInControl,
      playerScore,
      dispatch,
    }: SocketHook = useSocket();

    onMounted(() => {
      connectSocket(props.twitchId);
    });

    return {
      socketLoaded,
      socketConnected,
    };
  },
});
</script>

<style lang="scss">
.main-container {
  color: white;
}
</style>
