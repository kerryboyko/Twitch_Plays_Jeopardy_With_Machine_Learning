import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

const sockets = (http: HttpServer) => {
  const io = new Server(http, {cors: {origin: "http://localhost:8080", methods: ["GET", "POST"]}});

  io.on("connection", (socket: Socket) => {
    io.emit('message', 'the front-end DOES get this'); 
    socket.emit('message', "the front end also gets this")
    console.log(`connected: ${socket.id}`);
    socket.on('message', (msg: string) => {
      console.log(msg);
      socket.emit('message', `echo ${msg}`)
    })
    socket.on('disconnect', () => {
      console.log(`disconnected: ${socket.id}`)
    })
  });
};

export default sockets;
