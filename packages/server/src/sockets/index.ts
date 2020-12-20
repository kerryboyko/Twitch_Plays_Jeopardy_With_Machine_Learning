import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import GameManager from "../GameManager";
import { wsClient, wsServer } from "./commands";

const sockets = (http: HttpServer, game: GameManager): Server => {
  const io = new Server(http, {
    cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] },
  });
  game.setIo(io);
  io.on("connection", (socket: Socket) => {
    socket.on(wsClient.REGISTER_PLAYER, async (playerName: string) => {
      await game.handleRegisterPlayer(playerName, socket.id);
      socket.emit(wsServer.PLAYER_REGISTERED, playerName);
      socket.emit(wsServer.CURRENT_STATUS, game.grabCurrentStatus());
    });
    socket.on(wsClient.START_GAME, async (seed?: string) => {
      await game.startGame(seed);
      socket.emit(wsServer.GAME_START_TIME, game.gameStartTime);
    });
    socket.on(
      wsClient.SELECT_CLUE,
      async (playerName: string, categoryName: string, value: number) => {
        await game.handleSelectClue(playerName, categoryName, value);
      }
    );
    socket.on(
      wsClient.PROVIDE_WAGER,
      async (playerName: string, wager: number) => {
        await game.handleWager(playerName, wager);
      }
    );
    socket.on(
      wsClient.PROVIDE_ANSWER,
      async (playerName: string, provided: string) => {
        await game.handleAnswer(playerName, provided);
      }
    );
  });

  return io;
};

export default sockets;
