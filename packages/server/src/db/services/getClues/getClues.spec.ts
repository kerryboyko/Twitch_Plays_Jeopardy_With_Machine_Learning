// import fs from "fs";
import randomSeed from "random-seed";
import { groupByAirdate, getRandomCategories, stripDuplicateClues } from ".";
import { JeopardyClue } from "../../../types";
// mocks
import starwars from "./mocks/starwars.json";
import testBoard from "./mocks/testBoard.json";
import testBoard2 from "./mocks/testBoard2.json";
import duplicateClues from "./mocks/duplicateClues.json";

jest.setTimeout(10000);

test("stripDuplicateClues", () => {
  expect(duplicateClues).toHaveLength(10);
  expect(stripDuplicateClues(duplicateClues)).toHaveLength(5);
});

test("groupByAirdate", () => {
  const groupedSW = groupByAirdate(starwars["star wars"] as JeopardyClue[]);
  expect(Object.keys(groupedSW).sort()).toEqual([
    "1998-04-29T12:00:00.000Z",
    "1999-02-23T12:00:00.000Z",
    "2006-01-05T12:00:00.000Z",
    "2006-11-17T12:00:00.000Z",
    "2007-05-29T12:00:00.000Z",
  ]);
});

test("getRandomCategories", async () => {
  const board = await getRandomCategories(13, randomSeed.create("test seed"));
  expect(board).toEqual(testBoard);
  const board2 = await getRandomCategories(
    13,
    randomSeed.create("test seed 2")
  );
  expect(board2).toEqual(testBoard2);
});
