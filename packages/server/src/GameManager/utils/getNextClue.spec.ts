import randomSeed from "random-seed";
import testBoard2 from "../../db/services/getClues/mocks/testBoard2.json";
import { ClueCategory } from "../../types";
import getNextClue from "./getNextClue";

const rand = randomSeed.create("test");

const tb2: ClueCategory[] = (testBoard2 as ClueCategory[]).slice(0, 6);

describe("getNextClue", () => {
  it("gets the next clue", () => {
    expect(getNextClue(tb2)).toEqual([0, 0]);
  });
  it("gets the next clue after clues selected", () => {
    for (let i = 0; i < 5; i++) {
      tb2[0].clues[i] = null;
      tb2[1].clues[i] = null;
    }
    tb2[2].clues[0] = null;
    tb2[2].clues[1] = null;
    expect(getNextClue(tb2)).toEqual([2, 2]);
  });
  it("returns null if the tb2 is done", () => {
    for (let c = 0; c < 6; c++) {
      for (let i = 0; i < 5; i++) {
        tb2[c].clues[i] = null;
      }
    }
    expect(getNextClue(tb2)).toBeNull();
  });
});
