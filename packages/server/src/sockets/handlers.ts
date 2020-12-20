import { Server, Socket } from "socket.io";

const handlers = (io: Server, socket: Socket): void => {
  console.log("handling", typeof io, typeof socket);
};

export default handlers;
