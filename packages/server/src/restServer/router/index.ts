import type { Express } from 'express';
import evaluateAnswers from './evaluateAnswers';
import clues from './clues';
import corrections from './corrections';

export const router = (app: Express): Express =>
  [clues, evaluateAnswers, corrections].reduce((pv: Express, cv: Function) => cv(pv), app);

export default router;
