import invert from "lodash/invert";
import { ClueCategory } from "../../types";
import getCategoryKeywords from "./getCategoryKeywords";

export const createBoard = (
  clueSet: ClueCategory[]
): {
  lookup: Record<string, number>;
  clueSet: ClueCategory[];
} => {
  const invertedKeys = invert(
    getCategoryKeywords(clueSet.map(({ category }) => category))
  );
  const lookup = clueSet.reduce((accum, { category }, index) => {
    return { ...accum, [invertedKeys[category]]: index };
  }, {});
  return { lookup, clueSet };
};

export default createBoard;
