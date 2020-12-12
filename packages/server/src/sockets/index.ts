import { Server as HttpServer } from "http";
import { Server } from "socket.io";

const sockets = (http: HttpServer): Server => {
  const io = new Server(http, {
    cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] },
  });
  io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);
  });
  return io;
};

export default sockets;
