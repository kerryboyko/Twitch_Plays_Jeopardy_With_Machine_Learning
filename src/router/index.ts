import type { Express } from 'express';
// import answers from './answers';
import clues from './clues';
// import corrections from './corrections';

export const router = (app: Express): Express => [clues].reduce((pv: Express, cv: Function) => cv(pv), app);

export default router;
