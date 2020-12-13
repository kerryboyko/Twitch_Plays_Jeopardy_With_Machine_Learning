export const JEOPARDY_DD_RATES = [4, 756, 2492, 3636, 3112];
export const ACCUM_JEOPARDY_DD_RATES = [4, 760, 3252, 6888, 10000];

export const J_VALS = [200, 400, 600, 800, 1000];
export const DJ_VALS = [400, 800, 1200, 1600, 2000];

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;

export const JTiming: Record<string, number> = {
  startGame: 3 * MINUTE,
  clueTime: 30 * SECOND,
  selectTime: 30 * SECOND,
  wagerTime: 30 * SECOND,
  responseTime: 30 * SECOND,
  answerTime: 30 * SECOND,
  afterAnswer: 10 * SECOND,
  minimumShowFinalScoreTime: 30 * SECOND,
  helpTimeout: 1.5 * MINUTE,
};
