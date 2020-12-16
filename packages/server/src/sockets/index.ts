import { Server as HttpsServer } from "https";
import { Server } from "socket.io";

const sockets = (https: HttpsServer): Server => {
  const io = new Server(https, {
    cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] },
  });
  io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);
  });
  return io;
};

export default sockets;
