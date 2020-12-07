import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

const sockets = (http: HttpServer) => {
  const io = new Server(http);
  io.on("connection", (socket: Socket) => {
    console.log(`connected: ${socket.id}`);
  });
};

export default sockets;
