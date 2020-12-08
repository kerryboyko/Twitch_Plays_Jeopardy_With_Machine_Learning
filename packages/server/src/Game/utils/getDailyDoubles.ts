import { RandomSeed } from "random-seed";

// times out of 10000 that the DD will be at that value.
import { JEOPARDY_DD_RATES } from "./constants";

const getDailyDouble = (rand: RandomSeed): number => {
  let runningTally = 0;
  const valAmt = rand(10000);
  for (let i = 0, l = 5; i < l; i++) {
    runningTally += JEOPARDY_DD_RATES[i];
    if (valAmt < runningTally) {
      return i;
    }
  }
  return 4;
};

const getDailyDoubles = (
  rand: RandomSeed,
  isDoubleJeopardy = false
): [number, number][] => {
  const dd1 = getDailyDouble(rand);
  const dd2 = getDailyDouble(rand);
  if (!isDoubleJeopardy) {
    return [[dd1, rand(6)]];
  }
  const first = rand(6);
  let second = rand(6);
  while (second === first) {
    second = rand(6);
  }
  return [
    [dd1, first],
    [dd2, second],
  ];
};

export default getDailyDoubles;
