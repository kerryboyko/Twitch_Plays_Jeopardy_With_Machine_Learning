import { io, Socket } from "socket.io-client";
// import {useActions} from 'vuex-composition-helpers';
import { wsServer, wsClient } from "@jeopardai/server/src/sockets/commands";

const useSocket = (): Socket => {
  const socket: Socket = io("http://localhost:8000");
  console.log({ wsServer, wsClient });
  // socket.on("message", (msg: string) => {
  //   console.log("msg:", msg);
  //   state.responses.push(msg);
  // });
  // socket.on("connected", () => {
  //   console.log("connected");
  // });
  // const sendMessage = () => {
  //   socket.emit("message", state.inputField);
  // };
  return socket;
};

export default useSocket;
