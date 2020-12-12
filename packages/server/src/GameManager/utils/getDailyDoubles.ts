import { RandomSeed } from "random-seed";

// times out of 10000 that the DD will be at that value.
import { ACCUM_JEOPARDY_DD_RATES } from "./constants";

const getDailyDouble = (rand: RandomSeed): number => {
  const valAmt = rand(10000);
  for (let i = 0, l = ACCUM_JEOPARDY_DD_RATES.length; i < l; i++) {
    if (valAmt < ACCUM_JEOPARDY_DD_RATES[i]) {
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
    return [[rand(6), dd1]];
  }
  const first = rand(6);
  let second = rand(6);
  while (second === first) {
    second = rand(6);
  }
  return [
    [first, dd1],
    [second, dd2]
  ];
};

export default getDailyDoubles;
