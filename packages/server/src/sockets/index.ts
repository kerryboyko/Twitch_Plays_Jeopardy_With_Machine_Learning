import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import get from "lodash/get";
import GameManager from "../GameManager";
import { wsClient, wsServer } from "./commands";

const clientStore = () => {
  const clients: Record<string, string> = {};
  const setClient = (twitchId: string, socketId: string): void => {
    clients[twitchId] = socketId;
  };
  const getClient = (twitchId: string): string => clients[twitchId];
  return { clients, setClient, getClient };
};

const sockets = (
  http: HttpServer,
  game: GameManager
): {
  io: Server;
  getClient: (twitchId: string) => string;
  clients: Record<string, string>;
} => {
  const { clients, setClient, getClient } = clientStore();
  const io = new Server(http, {
    cors: { origin: "http://localhost:8080", methods: ["GET", "POST"] },
  });
  game.setIo(io, getClient, clients);
  io.on("connection", (socket: Socket) => {
    console.log("New Connection: ", socket.id);
    socket.on(wsClient.START_GAME, async ({ seed }: { seed?: string }) => {
      console.log("socket on start game", "seed provided, if any", seed);
      if (game.isGameRunning()) {
        socket.emit(wsServer.GAME_IN_PROGRESS);
      } else {
        await game.startGame(seed);
        socket.emit(wsServer.GAME_START_TIME, game.gameStartTime);
      }
      console.log(game.grabCurrentStatus());
      socket.emit(wsServer.CURRENT_STATUS, game.grabCurrentStatus());
    });
    socket.on(wsClient.REGISTER_PLAYER, async (twitchId: string) => {
      setClient(twitchId, socket.id);
      console.log(wsClient.REGISTER_PLAYER, twitchId, getClient(twitchId));
      await game.handleRegisterPlayer(twitchId, socket.id);
      socket.emit(wsServer.PLAYER_REGISTERED, {
        seed: game.getSeed(),
        twitchId,
        socketId: socket.id,
      });
      socket.emit(wsServer.CURRENT_STATUS, game.grabCurrentStatus());
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

  return { io, clients, getClient };
};

export default sockets;
