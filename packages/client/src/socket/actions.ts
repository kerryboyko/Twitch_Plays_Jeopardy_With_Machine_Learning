/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsClient } from "@jeopardai/server/src/sockets/commands";
import { socket } from "./socket";

export const startGame = (seed?: string): void => {
  console.log("emitting", wsClient.START_GAME, seed);
  socket.emit(wsClient.START_GAME, seed);
};

export const registerPlayer = (twitchId: string): void => {
  console.log("emitting", wsClient.REGISTER_PLAYER, { twitchId });
  socket.emit(wsClient.REGISTER_PLAYER, { twitchId });
};

export const provideAnswer = (twitchId: string, answer: string): void => {
  console.log("emitting", wsClient.PROVIDE_ANSWER, { twitchId, answer });
  socket.emit(wsClient.PROVIDE_ANSWER, { twitchId, answer });
};

export const provideWager = (twitchId: string, wager: number): void => {
  console.log("emitting", wsClient.PROVIDE_WAGER, { twitchId, wager });
  socket.emit(wsClient.PROVIDE_WAGER, { twitchId, wager });
};

export const selectClue = (
  twitchId: string,
  category: string,
  value: number
): void => {
  console.log("emitting", wsClient.SELECT_CLUE, { twitchId, category, value });
  socket.emit(wsClient.SELECT_CLUE, { twitchId, category, value });
};

export default {
  startGame,
  registerPlayer,
  provideAnswer,
  selectClue,
  provideWager,
};
