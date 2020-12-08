import makeEnum from "../utils/makeEnum";

export const wsServer = makeEnum(
  "wsServer",
  "INFO",
  "GAME_START_TIME",
  "CONNECTED",
  "CLUES",
  "GAME_STATE_CHANGE"
);
export const wsClient = makeEnum("wsClient", "CONNECTED", "CONFIRM_CLUES");
