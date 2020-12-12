import invert from "lodash/invert";
import { RandomSeed } from "random-seed";
import { ClueCategory, JeopardyClue } from "../../types";
import getCategoryKeywords from "./getCategoryKeywords";
import getDailyDoubles from "./getDailyDoubles";

export const createBoard = (
  inputClueSet: ClueCategory[],
  rand: RandomSeed,
  isDoubleJeopardy = false
): {
  lookup: Record<string, number>;
  clueSet: ClueCategory[];
} => {
  const dailyDoubles = getDailyDoubles(rand, isDoubleJeopardy);
  const keys = getCategoryKeywords(
    inputClueSet.map(({ category }) => category)
  );
  const invertedKeys = invert(keys);
  const outputClueSet: ClueCategory[] = inputClueSet.map(categoryObj => ({
    ...categoryObj,
    key: invertedKeys[categoryObj.category]
  }));
  for (const dd of dailyDoubles) {
    const [cat, val] = dd;
    (outputClueSet[cat].clues[val] as JeopardyClue).isDailyDouble = true;
  }
  const lookup = inputClueSet.reduce((accum, { category }, index) => {
    return { ...accum, [invertedKeys[category]]: index };
  }, {});
  return { lookup, clueSet: outputClueSet };
};

export default createBoard;
