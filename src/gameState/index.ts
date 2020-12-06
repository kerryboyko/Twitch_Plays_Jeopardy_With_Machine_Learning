import { JeopardyClue } from '../types';
import makeEnum from '../utils/makeEnum';

const gameEvents = makeEnum(
  'game',
  'END_GAME',
  'START_GAME',
  'START_JEOPARDY',
  'START_DOUBLE_JEOPARDY',
  'START_FINAL_JEOPARDY',
  'REGISTER_PLAYER'
);

const clueEvents = makeEnum(
  'clue',
  'LOAD_QUESTION',
  'DO_DAILY_DOUBLE',
  'REVEAL_CLUE',
  'COLLECT_ANSWERS',
  'ADJUST_SCORES'
);

const dailyDoubleEvents = makeEnum('dailyDouble', 'COLLECT_WAGER', 'REVEAL_CLUE', 'COLLECT_ANSWER', 'ADJUST_SCORES');

const finalJeopardyEvents = makeEnum(
  'finalJeopardy',
  'REVEAL_CATEGORY',
  'COLLECT_WAGER',
  'REVEAL_CLUE',
  'COLLECT_ANSWER',
  'ADJUST_SCORES'
);

interface DailyDoubleSchema {
  states: {
    collectDDWager: {};
    revealDDClue: {};
    collectDDAnswer: {};
    judgeDDScores: {};
  };
}

interface ClueStateSchema {
  states: {
    nextQuestion: {};
    dailyDouble: DailyDoubleSchema;
    revealClue: {};
    collectAnswers: {};
    judgeScores: {};
  };
}

interface FinalJeopardySchema {
  states: {
    revealFJCategory: {};
    collectFJWagers: {};
    revealFJClue: {};
    collectFJAnswers: {};
    judgeFJScore: {};
  };
}

interface GameStateSchema {
  states: {
    gameOff: {};
    loadGame: {};
    jeopardy: ClueStateSchema;
    doubleJeopardy: ClueStateSchema;
    finalJeopardy: FinalJeopardySchema;
  };
}

interface GameContext {
  board: Map<string, (JeopardyClue & { isLive: boolean })[]>;
  currentControl: string | null;
  currentClue: [string, number]; // category, value
  currentAnswers: Record<string, { answered: string; accepted: boolean }>;
  players: Map<string, number>;
}

type GameEvent =
  | { type: 'END_GAME' }
  | { type: 'START_GAME' }
  | { type: 'START_JEOPARDY' }
  | { type: 'START_DOUBLE_JEOPARDY' }
  | { type: 'START_FINAL_JEOPARDY' };

type ClueEvent =
  | { type: 'LOAD_QUESTION' }
  | { type: 'DO_DAILY_DOUBLE' }
  | { type: 'REVEAL_CLUE' }
  | { type: 'COLLECT_ANSWERS'; answers: Record<string, { answered: string; accepted: boolean }> }
  | { type: 'JUDGE_SCORES' };

type DailyDoubleEvent =
  | { type: 'COLLECT_DD_WAGER' }
  | { type: 'REVEAL_DD_CLUE' }
  | { type: 'COLLECT_DD_ANSWER'; answers: Record<string, { answered: string; accepted: boolean }> }
  | { type: 'JUDGE_DD_SCORES' };

type FinalJeopardyEvent =
  | { type: 'REVEAL_FJ_CATEGORY' }
  | { type: 'COLLECT_FJ_WAGER' }
  | { type: 'COLLECT_FJ_ANSWERS'; answers: Record<string, { answered: string; accepted: boolean }> }
  | { type: 'JUDGE_FJ_SCORES' };

type JEvent = GameEvent | ClueEvent | DailyDoubleEvent | FinalJeopardyEvent;

const GameMachine = Machine<GameContext, {}, JEvent>({
  key: 'jeopardy',
  initial: 'gameOff',
});
