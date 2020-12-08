import randomSeed from "random-seed";
import getDailyDoubles from "./getDailyDoubles";

test("get daily doubles", () => {
  expect(getDailyDoubles(randomSeed.create("test one"), false)).toEqual([
    [3, 3],
  ]);
  expect(getDailyDoubles(randomSeed.create("test two"), true)).toEqual([
    [4, 5],
    [1, 1],
  ]);
  expect(getDailyDoubles(randomSeed.create("test three"), true)).toEqual([
    [2, 3],
    [3, 4],
  ]);
});
