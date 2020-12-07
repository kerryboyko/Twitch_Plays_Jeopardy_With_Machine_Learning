import type { Express } from 'express';
import evaluateAnswers from './evaluateAnswers';
import clues from './clues';
import corrections from './corrections';
import canary from './canary';

export const router = (app: Express): Express =>
  [canary, clues, evaluateAnswers, corrections].reduce((pv: Express, cv: Function) => cv(pv), app);

export default router;
