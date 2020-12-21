/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsClient } from "@jeopardai/server/src/sockets/commands";
import { socket } from "./socket";

const startGame = (seed?: string): void => {
  socket.emit(wsClient.START_GAME, seed);
};

const registerPlayer = (twitchId: string): void => {
  socket.emit(wsClient.REGISTER_PLAYER, twitchId);
};

export default { startGame, registerPlayer };
