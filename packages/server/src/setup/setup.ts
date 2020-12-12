import { Server as SocketServer } from "socket.io";
import GameManager from "../GameManager";
import { wsClient, wsServer } from "../sockets/commands";
import { GameState } from "../types";

const setup = (io: SocketServer, testSeed?: string): (() => void) =>
  (() => {
    // closures for singleton.
    let game: GameManager;

    const checkGameRunning = (): boolean => {
      if (game === undefined || game.gameState === GameState.None) {
        // this is a side effect - normally bad practice, but
        // saves us a lot of WET boilerplate.
        io.emit(
          wsServer.NO_GAME_RUNNING,
          `Sorry. There is no game running. Try starting one!`
        );
        return false;
      }
      return true;
    };
    // main body.

    return (): void => {
      // public commands
      io.on(wsClient.START_GAME, () => {
        if (game !== undefined && game.gameState !== GameState.None) {
          io.emit(
            wsServer.GAME_IN_PROGRESS,
            `Sorry. There is a game already in progress`
          );
          return;
        }
        game = new GameManager({ toFrontEnd: io.emit }, testSeed);
        game.handleStartGame();
      });
      io.on(wsClient.REGISTER_PLAYER, ({ playerName }) => {
        if (checkGameRunning()) {
          game.handleRegisterPlayer(playerName);
        }
      });
      io.on(wsClient.PROVIDE_ANSWER, ({ playerName, provided }) => {
        if (checkGameRunning()) {
          game.handleAnswer(playerName, provided);
        }
      });
      io.on(wsClient.PROVIDE_WAGER, ({ playerName, wager }) => {
        if (checkGameRunning()) {
          game.handleWager(playerName, wager);
        }
      });
      io.on(wsClient.SELECT_CLUE, ({ playerName, categoryKey, value }) => {
        if (checkGameRunning()) {
          game.handleSelectClue({ playerName, categoryKey, value });
        }
      });
    };
  })();

export default setup;
