import randomSeed from "random-seed";
import getDailyDoubles from "./getDailyDoubles";

test("get daily doubles", () => {
  expect(getDailyDoubles(randomSeed.create("test one"), false)).toEqual([
    [3, 3],
  ]);
  expect(getDailyDoubles(randomSeed.create("test two"), true)).toEqual([
    [5, 4],
    [1, 1],
  ]);
  expect(getDailyDoubles(randomSeed.create("test three"), true)).toEqual([
    [3, 2],
    [4, 3],
  ]);
});
