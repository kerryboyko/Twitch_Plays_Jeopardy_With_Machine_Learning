import { defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";
import { io, Socket } from "socket.io-client";

export default defineComponent({
  name: "Socket",
  props: {
    twitchId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    if (props.twitchId !== "") {
      const socket: Socket = io("http://localhost:4000", {
        query: `twitchId=${props.twitchId}`,
      });
      socket.on("connect", () => {
        console.log(`connected: ${props.twitchId}, ${socket.id}`);
      });
      socket.on(wsServer.CONNECTION_CONFIRMED, () => {
        store.commit("CONNECTION_CONFIRMED", {
          socketId: socket.id,
          twitchId: props.twitchId,
        });
      });
    }
    return {};
  },
});
