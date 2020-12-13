import { io, Socket } from "socket.io-client";
import { reactive, toRefs } from "vue";
// import {useActions} from 'vuex-composition-helpers';
import { wsServer, wsClient } from "@jeopardai/server/src/sockets/commands";

interface ChatMsg {
  user: string;
  timestamp: Date;
  message: string;
}

const useSocket = (() => {
  const socket: Socket = io("http://localhost:8000");

  return () => {
    const state = reactive<{ chatLog: ChatMsg[] }>({
      chatLog: [],
    });
    socket.on(wsServer.CHAT_LOG, (data: string) => {
      const { user, message } = JSON.parse(data);
      state.chatLog.push({ user, message, timestamp: new Date() });
    });

    return { ...toRefs(state) };
  };
})();

export default useSocket;
