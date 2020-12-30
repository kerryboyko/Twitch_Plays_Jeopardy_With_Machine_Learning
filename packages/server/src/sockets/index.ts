/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import GameManager from "../GameManager";
import { wsClient, wsServer } from "./commands";

const sockets = (
  http: HttpServer,
  game: GameManager
): {
  io: Server;
} => {
  const io = new Server(http, {
    cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] },
  });
  game.setIo(io);
  io.on("connection", (socket: Socket) => {
    console.log("New Connection: ", socket.id);
    socket.emit(wsServer.CURRENT_STATUS, game.grabCurrentStatus());

    socket.on(wsClient.START_GAME, async (payload?: { seed?: string }) => {
      if (game.isGameRunning()) {
        socket.emit(wsServer.GAME_IN_PROGRESS);
      } else {
        console.log("GAME STARTING");
        await game.startGame(payload?.seed);
        socket.emit(wsServer.GAME_START_TIME, {
          startTime: game.gameStartTime,
        });
      }
      // send to all connected, even if they didn't start the game themselves.
      io.emit(wsServer.CURRENT_STATUS, game.grabCurrentStatus());
    });
    socket.on(
      wsClient.REGISTER_PLAYER,
      async ({ twitchId }: { twitchId: string }) => {
        await game.handleRegisterPlayer(twitchId, socket.id);
        socket.emit(wsServer.PLAYER_REGISTERED, {
          seed: game.getSeed(),
          twitchId,
          socketId: socket.id,
        });
        socket.emit(wsServer.CURRENT_STATUS, game.grabCurrentStatus());
      }
    );
    socket.on(
      wsClient.SELECT_CLUE,
      async (payload: {
        twitchId: string;
        category: string;
        valueIndex: number;
      }) => {
        await game.handleSelectClue(payload);
      }
    );
    socket.on(
      wsClient.PROVIDE_WAGER,
      async (payload: { twitchId: string; wager: number }) => {
        await game.handleWager(payload);
      }
    );
    socket.on(
      wsClient.PROVIDE_ANSWER,
      async (payload: { twitchId: string; provided: string }) => {
        await game.handleAnswer(payload);
      }
    );
    socket.on(wsClient.DEBUG, async (...params: any[]) => {
      console.log(...params);
      await game.debugHandler(...params);
    });
  });

  return { io };
};

export default sockets;
