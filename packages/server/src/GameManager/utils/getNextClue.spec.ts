import randomSeed from "random-seed";
import testBoard2 from "../../db/services/getClues/mocks/testBoard2.json";
import { ClueCategory } from "../../types";
import createBoard from "./createBoard";
import getNextClue from "./getNextClue";

const rand = randomSeed.create("test");

const tb2: ClueCategory[] = (testBoard2 as ClueCategory[]).slice(0, 6);

const board = createBoard(tb2, rand, true);

describe("getNextClue", () => {
  it("gets the next clue", () => {
    expect(getNextClue(board.clueSet)).toEqual([0, 0]);
  });
  it("gets the next clue after clues selected", () => {
    for (let i = 0; i < 5; i++) {
      board.clueSet[0].clues[i] = null;
      board.clueSet[1].clues[i] = null;
    }
    board.clueSet[2].clues[0] = null;
    board.clueSet[2].clues[1] = null;
    expect(getNextClue(board.clueSet)).toEqual([2, 2]);
  });
  it("returns null if the board is done", () => {
    for (let c = 0; c < 6; c++) {
      for (let i = 0; i < 5; i++) {
        board.clueSet[c].clues[i] = null;
      }
    }
    expect(getNextClue(board.clueSet)).toBeNull();
  });
});
