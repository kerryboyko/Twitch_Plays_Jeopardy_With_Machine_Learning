<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onBeforeMount, onBeforeUnmount } from "vue";
import { socket } from "./socket";
import { useStore } from "vuex";
import { wsServer, wsClient } from "@jeopardai/server/src/sockets/commands";

export default defineComponent({
  name: "SocketComponent",
  setup() {
    const store = useStore();
    socket.on(wsServer.BACKEND_GAME_STATE, (payload: any) => {
      console.log("BACKEND GAME STATE", payload);
    });
    for (const dispatchType of Object.values(wsServer)) {
      socket.on(dispatchType, (payload?: any) => {
        console.log("recieving", dispatchType, payload);
        store.commit(dispatchType, payload);
      });
    }
    (window as any).debugEmit = (payload: any): void => {
      socket.emit(wsClient.DEBUG, payload);
    };
  },
  render() {
    return null;
  },
});
</script>
