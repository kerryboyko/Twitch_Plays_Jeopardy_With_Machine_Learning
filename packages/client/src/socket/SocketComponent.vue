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
    for (const dispatchType of Object.values(wsServer)) {
      socket.on(dispatchType, (payload?: any) => {
        console.log("recieving", dispatchType, payload);
        store.commit(dispatchType, payload);
      });
    }
  },
  render() {
    return null;
  },
});
</script>
