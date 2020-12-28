import { ClueCategory } from "../../types";

export const getNextClue = (
  clueSet: ClueCategory[]
): [string, number] | null => {
  for (let cat = 0, setL = clueSet.length; cat < setL; cat++) {
    for (let val = 0, cluesL = clueSet[cat].clues.length; val < cluesL; val++) {
      if (clueSet[cat].clues[val] !== null) {
        return [clueSet[cat].category, val];
      }
    }
  }
  return null;
};

export default getNextClue;
