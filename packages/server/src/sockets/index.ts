import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import GameManager from "../GameManager";
import { wsClient, wsServer } from "./commands";
import get from "lodash/get";

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
    const twitchId = get(socket.handshake.query, ["twitchId"], "");
    if (twitchId !== "") {
      setClient(twitchId, socket.id);
      socket.emit(wsServer.CONNECTION_CONFIRMED);
    }
    console.log("New Connection: ", twitchId, socket.id);
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

  return { io, clients, getClient };
};

export default sockets;
