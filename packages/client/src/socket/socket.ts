import { Socket, io } from "socket.io-client";

export const socket: Socket = io("http://localhost:4000");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).debugEmit = (type: string, ...args: any[]) =>
  socket.emit(type, ...args);

export default socket;
