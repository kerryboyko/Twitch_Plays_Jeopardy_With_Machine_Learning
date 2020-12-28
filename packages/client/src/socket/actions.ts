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

export const provideAnswer = (payload: {
  twitchId: string;
  provided: string;
}): void => {
  console.log("emitting", wsClient.PROVIDE_ANSWER, payload);
  socket.emit(wsClient.PROVIDE_ANSWER, payload);
};

export const provideWager = (payload: {
  twitchId: string;
  wager: number;
}): void => {
  console.log("emitting", wsClient.PROVIDE_WAGER, payload);
  socket.emit(wsClient.PROVIDE_WAGER, payload);
};

export const selectClue = (payload: {
  twitchId: string;
  category: string;
  valueIndex: number;
}): void => {
  console.log("emitting", wsClient.SELECT_CLUE, payload);
  socket.emit(wsClient.SELECT_CLUE, payload);
};

export default {
  startGame,
  registerPlayer,
  provideAnswer,
  selectClue,
  provideWager,
};
