/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";

import { wsServer } from "@jeopardai/server/src/sockets/commands";

const useSocket = (twitchId: string, store: any): void => {
  const socket: Socket = io("http://localhost:8080", {
    query: `twitchId=${twitchId}`,
  });
  const specialtySockets: Record<string, (...args: any) => void> = {
    connect: () => store.commit("connect", { socketId: socket.id, twitchId }),
    [wsServer.PROMPT_SELECT_CLUE]: () =>
      store.commit(wsServer.PROMPT_SELECT_CLUE, { twitchId }),
  };
  // connect directly to vuex store, do not pass go, do not collect $200.
  socket.onAny((eventType: string, payload: any) => {
    console.log(eventType, payload);
    if (Object.keys(specialtySockets).includes(eventType)) {
      specialtySockets[eventType](payload);
    } else {
      store.commit(eventType, payload);
    }
  });
};

export default useSocket;
