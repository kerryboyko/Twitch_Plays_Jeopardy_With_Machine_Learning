/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsClient } from "@jeopardai/server/src/sockets/commands";
import { socket } from "./socket";

const startGame = (seed?: string): void => {
  console.log(wsClient.START_GAME, seed);
  socket.emit(wsClient.START_GAME, seed);
};

export const registerPlayer = (twitchId: string): void => {
  console.log(wsClient.REGISTER_PLAYER, { twitchId });
  socket.emit(wsClient.REGISTER_PLAYER, { twitchId });
};

export const provideAnswer = (twitchId: string, answer: string): void => {
  console.log(wsClient.PROVIDE_ANSWER, { twitchId, answer });
  socket.emit(wsClient.PROVIDE_ANSWER, { twitchId, answer });
};

export const selectClue = (
  twitchId: string,
  category: string,
  value: number
): void => {
  console.log(wsClient.PROVIDE_ANSWER, { twitchId, category, value });
  socket.emit(wsClient.PROVIDE_ANSWER, { twitchId, category, value });
};

export default { startGame, registerPlayer, provideAnswer, selectClue };