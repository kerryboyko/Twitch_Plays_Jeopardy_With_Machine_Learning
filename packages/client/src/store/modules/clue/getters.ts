/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClueState } from "@jeopardai/server/src/types";
import { ClueData } from ".";
import { GameData } from "../game";
import { UserData } from "../user";

export const isInputEnabled = (
  state: ClueData,
  _getters: any,
  rootState: { game: GameData; user: UserData },
  _rootGetters: any
): boolean => {
  const isAnswerTime =
    state.clueState === ClueState.DisplayClue && !state.answerLocked;
  if (!isAnswerTime || state.answerLocked) {
    return false;
  }
  const playerIsControlling =
    rootState.game.controllingPlayer === rootState.user.twitchId;
  return state.isDailyDouble ? playerIsControlling : true;
};

export default {
  isInputEnabled,
};
