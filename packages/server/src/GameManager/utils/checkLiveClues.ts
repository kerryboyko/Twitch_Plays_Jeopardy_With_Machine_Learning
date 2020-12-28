import { ClueCategory } from "../../types";

export const checkLiveClues = (
  board: ClueCategory[]
): Record<string, boolean[]> => {
  return board.reduce(
    (pv: Record<string, boolean[]>, clueCat: ClueCategory) => ({
      ...pv,
      [clueCat.category]: clueCat.clues.map(
        (clue: unknown | null) => clue !== null
      ),
    }),
    {}
  );
};

export default checkLiveClues;
