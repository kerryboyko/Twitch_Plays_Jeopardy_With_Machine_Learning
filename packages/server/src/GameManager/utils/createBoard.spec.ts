import randomSeed from "random-seed";
import invert from "lodash/invert";
import testBoard2 from "../../db/services/getClues/mocks/testBoard2.json";
import { ClueCategory } from "../../types";
import createBoard from "./createBoard";

const rand = randomSeed.create("test");

const tb2: ClueCategory[] = (testBoard2 as ClueCategory[]).slice(0, 6);

test("createBoard", () => {
  const board = createBoard(tb2, rand, true);
  const expectedLookup = {
    dawn: 5,
    europe: 3,
    international: 0,
    make: 1,
    shout: 4,
    twitters: 2,
  };
  expect(board).toEqual({
    clueSet: tb2.map((cat, index) => ({
      ...cat,
      key: invert(expectedLookup)[index.toString()],
    })),
    lookup: expectedLookup,
  });
  expect(board.clueSet[board.lookup.dawn].category).toBe("dawn");
  expect(board.clueSet[board.lookup.europe].category).toBe("europe");
  expect(board.clueSet[board.lookup.international].category).toBe(
    "international cuisine"
  );
  expect(board.clueSet[board.lookup.make].category).toBe("make room");
  expect(board.clueSet[board.lookup.shout].category).toBe(
    "one-word shout outs"
  );
  expect(board.clueSet[board.lookup.twitters].category).toBe(
    "the author twitters"
  );
});
