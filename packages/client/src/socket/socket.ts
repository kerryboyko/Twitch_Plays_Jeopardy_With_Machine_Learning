import { Socket, io } from "socket.io-client";
export const socket: Socket = io("http://localhost:4000");

export default socket;
