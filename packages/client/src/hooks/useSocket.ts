import { io, Socket } from "socket.io-client";
// import {useActions} from 'vuex-composition-helpers';

const useSocket = () => {
  const socket: Socket = io("http://localhost:8000");
 
  return socket;
}

export default useSocket;
