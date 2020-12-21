import { Socket } from "socket.io-client";
import { wsServer } from "@jeopardai/server/src/sockets/commands";
import {
  ClueState,
  GameState,
  StateSnapshot,
} from "@jeopardai/server/src/types";
import { SocketState, GameData, Clue } from "./index";
import { ComputedRef } from "vue";

const initializeClue = (): Clue => {
  return {};
};

export const loadHandlers = (
  socket: Socket,
  state: SocketState,
  game: GameData,
  isPlayerInControl: ComputedRef<boolean>
): void => {
  socket.on(wsServer.GAME_START_TIME, (startTime: number) => {
    game.gameStartTime = startTime;
  });
  socket.on(wsServer.INFO, (info: string) => {
    if (!game.info) {
      game.info = [];
    }
    game.info.push(info);
  });
  socket.on(wsServer.GAME_STATE_CHANGE, (gameState: GameState) => {
    game.gameState = gameState;
  });
  socket.on(wsServer.CLUE_STATE_CHANGE, (clueState: ClueState) => {
    game.clueState = clueState;
  });
  socket.on(wsServer.PLAYER_REGISTERED, (name: string) => {
    if (name === state.twitchId) {
      state.isRegistered = true;
    }
  });
  socket.on(wsServer.CURRENT_STATUS, (status: StateSnapshot) => {
    game.seed = status.seed;
    game.clueState = status.clueState;
    game.gameState = status.gameState;
    game.startTime = status.startTime;
    game.clue = status.currentClue;
    (game.controllingPlayer = status.controllingPlayer),
      (game.scoreboard = status.scoreboard);
  });
  socket.on(wsServer.SEND_CATEGORIES, (categories: Array<[string, string]>) => {
    game.categories = categories.map((c) => c[1]);
  });
  socket.on(
    wsServer.CHANGE_CONTROLLER,
    ({ controllingPlayer }: { controllingPlayer: string }) => {
      game.controllingPlayer = controllingPlayer;
    }
  );
  socket.on(wsServer.PROMPT_SELECT_CLUE, () => {
    game.clue = initializeClue();
    if (isPlayerInControl) {
      game.promptedForClue = true;
    }
  });
  socket.on(wsServer.CLUE_SELECTION_TIMEOUT, () => {
    if (isPlayerInControl) {
      game.promptedForClue = false;
    }
  });
  socket.on(wsServer.DISPLAY_CLUE, (clue: { [key: string]: any }) => {
    ["question", "value", "category"].forEach((prop: string) => {
      if (clue[prop]) {
        game.clue[prop] = clue[prop];
      }
    });
  });
  socket.on(wsServer.GET_DD_WAGER, () => {
    if (isPlayerInControl) {
      game.promptedForWager = true;
    }
  });
  socket.on(
    wsServer.DISPLAY_ANSWER,
    ({
      answer,
      currentScores,
    }: {
      answer: string;
      currentScores: Record<string, number>;
    }) => {
      game.clue.answer = answer;
      game.score = currentScores[state.twitchId];
    }
  );
  socket.on(
    wsServer.FJ_DISPLAY_CATEGORY,
    ({ category }: { category: string }) => {
      game.clue = initializeClue();
      game.clue.isFJ = true;
      game.category = category;
    }
  );
  socket.on(wsServer.FJ_DISPLAY_CLUE, ({ question }: { question: string }) => {
    game.fj.question = question;
  });
  socket.on(
    wsServer.FINAL_SCORES,
    ({ finalScores }: { finalScores: Array<[string, number]> }) => {
      const myScore = finalScores.findIndex(
        ([name, _score]) => name === state.twitchId
      );
      game.finalResults = {
        finalScore: finalScores[myScore][1],
        outOf: finalScores.length,
        placement: myScore + 1,
      };
    }
  );
};
