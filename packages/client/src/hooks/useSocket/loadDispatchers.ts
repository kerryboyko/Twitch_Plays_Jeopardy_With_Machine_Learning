import { Socket } from "socket.io-client";
import { wsClient } from "@jeopardai/server/src/sockets/commands";
import { GameState } from "@jeopardai/server/src/types";
import { SocketState, GameData, GameDispatchers } from "./index";
import { ComputedRef } from "vue";

export const loadDispatchers = (
  socket: Socket,
  state: SocketState,
  game: GameData,
  isPlayerInControl: ComputedRef<boolean>
): GameDispatchers => {
  const registerSelf = (): void => {
    if (state.twitchId && state.socketId) {
      socket.emit(wsClient.REGISTER_PLAYER, state.twitchId, state.socketId);
    }
  };
  const provideAnswer = (answer: string): void => {
    socket.emit(wsClient.PROVIDE_ANSWER, state.twitchId, answer);
  };
  const provideWager = (wager: number): void => {
    if (isPlayerInControl || game.gameState === GameState.FinalJeopardy) {
      socket.emit(wsClient.PROVIDE_WAGER, state.twitchId, wager);
    }
  };
  const selectClue = (categoryKey: string, value: number): void => {
    if (isPlayerInControl) {
      socket.emit(wsClient.SELECT_CLUE, state.twitchId, categoryKey, value);
    }
  };
  return {
    registerSelf,
    provideAnswer,
    provideWager,
    selectClue,
  };
};
