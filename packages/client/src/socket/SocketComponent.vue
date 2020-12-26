<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onBeforeMount, onBeforeUnmount } from "vue";
import { socket } from "./socket";
import { useStore } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export default defineComponent({
  name: "SocketComponent",
  setup() {
    const store = useStore();
    onBeforeMount(() => {
      for (const dispatchType in wsServer) {
        socket.on(dispatchType, (payload?: any) => {
          store.commit(dispatchType, payload);
        });
      }
    });
    onBeforeUnmount(() => {
      for (const dispatchType in wsServer) {
        socket.off(dispatchType);
      }
    });
  },
  render() {
    return null;
  },
});
</script>
