import { reactive, Ref, toRefs, computed, ComputedRef } from "vue";
import { io, Socket } from "socket.io-client";
import { ClueState, GameState } from "@jeopardai/server/src/types";
import { loadHandlers } from "./loadHandlers";
import { loadDispatchers } from "./loadDispatchers";

export interface SocketState {
  socketId: string | null;
  socketLoaded: boolean;
  socketConnected: boolean;
  error: string;
  twitchId: string;
  isRegistered: boolean;
}

export interface Clue {
  category?: string;
  question?: string;
  value?: number;
  answer?: string;
  isFJ?: boolean;
  [key: string]: any;
}

export interface GameData {
  gameStartTime: number;
  info: string[];
  gameState: GameState;
  clueState: ClueState;
  categories: string[];
  controllingPlayer: string;
  clue: Clue;
  finalResults: {
    placement?: number;
    outOf?: number;
    finalScore?: number;
  };
  scoreboard: Record<string, number>;
  [key: string]: any;
}
export interface GameDispatchers {
  registerSelf: () => void;
  provideAnswer: (answer: string) => void;
  provideWager: (wager: number) => void;
  selectClue: (category: string, value: number) => void;
}

interface SocketHook {
  socketLoaded: Ref<boolean>;
  socketConnected: Ref<boolean>;
  error: Ref<string>;
  twitchId: Ref<string>;
  connectSocket: (twitchId: string) => void;
  isPlayerInControl: ComputedRef<boolean>;
  playerScore: ComputedRef<number>;
  dispatch?: GameDispatchers;
}

const initializeState = (): SocketState => ({
  socketId: null,
  socketLoaded: false,
  socketConnected: false,
  error: "",
  twitchId: "",
  isRegistered: false,
});

const initializeGame = (): GameData => ({
  gameStartTime: 0,
  info: [],
  gameState: GameState.None,
  clueState: ClueState.None,
  categories: [],
  controllingPlayer: "",
  clue: {},
  scoreboard: {},
  finalResults: {},
});

// this is a singleton hook.
const useSocket = () => {
  let socket: Socket;
  let dispatch: GameDispatchers;
  return (): SocketHook => {
    const state = reactive<SocketState>(initializeState());
    const game = reactive<GameData>(initializeGame());

    const isPlayerInControl = computed(
      (): boolean => game.controllingPlayer === state.twitchId
    );
    const playerScore = computed(
      (): number => game.scoreboard[state.twitchId] || 0
    );

    const clearGame = () => {
      const clear: GameData = initializeGame();
      for (const prop in clear) {
        game[prop] = clear[prop];
      }
    };
    const connectSocket = (twitchId: string) => {
      state.twitchId = twitchId;
      try {
        socket = io("http://localhost:8000", {
          query: `twitchId=${twitchId}`,
        });
        state.socketLoaded = true;
        socket.on("connect", () => {
          state.socketId = socket.id;
          state.socketConnected = true;
        });
        socket.on("disconnect", () => {
          state.socketConnected = false;
        });
        loadHandlers(socket, state, game, isPlayerInControl);
        dispatch = loadDispatchers(socket, state, game, isPlayerInControl);
      } catch (err) {
        state.socketConnected = false;
        state.socketLoaded = false;
        state.error = err.message;
        clearGame();
      }
    };

    return {
      ...toRefs(state),
      connectSocket,
      isPlayerInControl,
      playerScore,
      dispatch,
    };
  };
};

export default useSocket();
