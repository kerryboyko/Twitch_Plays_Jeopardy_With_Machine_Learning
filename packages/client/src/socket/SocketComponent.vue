<script lang="ts">
import { defineComponent } from "vue";
import { socket } from "./socket";
import { useStore } from "vuex";
import { wsServer } from "@jeopardai/server/src/sockets/commands";
import { StateSnapshot } from "@jeopardai/server/src/types";

export default defineComponent({
  name: "SocketComponent",
  setup() {
    const store = useStore();
    socket.on(wsServer.GAME_START_TIME, (startTime: number) => {
      console.log("start time");
      store.commit(wsServer.GAME_START_TIME, { startTime });
    });
    socket.on(wsServer.GAME_IN_PROGRESS, () => {
      console.warn(`GAME IN PROGRESS!`);
    });
    socket.on(
      wsServer.PLAYER_REGISTERED,
      ({
        seed,
        twitchId,
        socketId,
      }: {
        seed: string;
        twitchId: string;
        socketId: string;
      }) => {
        console.log(wsServer.PLAYER_REGISTERED, seed);
        store.commit(wsServer.PLAYER_REGISTERED, { seed, twitchId, socketId });
      }
    );
    socket.on(wsServer.CURRENT_STATUS, (payload: StateSnapshot) => {
      store.commit(wsServer.CURRENT_STATUS, payload);
    });
    socket.on(wsServer.CHANGE_CONTROLLER, (controllingPlayer: string) => {
      store.commit(wsServer.CHANGE_CONTROLLER, { controllingPlayer });
    });
    socket.on(wsServer.SEND_CATEGORIES, (categories: string[]) => {
      store.commit(wsServer.SEND_CATEGORIES, { categories });
    });
  },
  render() {
    return null;
  },
});
</script>
