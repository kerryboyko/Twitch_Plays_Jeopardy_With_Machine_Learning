import { defineComponent } from "vue";
import { socket } from "./socket";
import { useStore } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";

export default defineComponent({
  name: "SocketComponent",
  setup() {
    const store = useStore();
    socket.on(wsServer.GAME_START_TIME, (startTime: number) => {
      console.log("start time");
      store.commit(wsServer.GAME_START_TIME, { startTime });
    });
  },
});
