import makeEnum from "../utils/makeEnum";

export const wsServer = makeEnum(
  "wsServer",
  "CONNECTION_CONFIRMED",
  "INFO",
  "CHAT_LOG",
  "SEED_NAME",
  "PLAYER_REGISTERED",
  "CURRENT_STATUS",
  "GAME_START_TIME",
  "SEND_CATEGORIES",
  "CHANGE_CONTROLLER",
  "FINAL_SCORES",
  "END_OF_ROUND",
  "GET_DD_WAGER",
  "WAGER_RECEIVED",
  "ANSWER_RECIEVED",
  "DISPLAY_CLUE",
  "DISPLAY_ANSWER",
  "PROMPT_SELECT_CLUE",
  "CLUE_SELECTION_TIMEOUT",
  "INVALID_CLUE_SELECTION",
  "FJ_DISPLAY_CATEGORY",
  "FJ_DISPLAY_CLUE",
  "PLAY_THINK_MUSIC",
  "CONNECTED",
  "CLUES",
  "GAME_STATE_CHANGE",
  "CLUE_STATE_CHANGE",
  "FINAL_JEOPARDY_STATE_CHANGE",
  "GAME_IN_PROGRESS",
  "NO_GAME_RUNNING",
  "BACKEND_GAME_STATE"
);

export const wsClient = makeEnum(
  "wsClient",
  "CONNECTED",
  "START_GAME",
  "CONFIRM_CLUES",
  "REGISTER_PLAYER",
  "PROVIDE_ANSWER",
  "PROVIDE_WAGER",
  "SELECT_CLUE",
  "DEBUG"
);
