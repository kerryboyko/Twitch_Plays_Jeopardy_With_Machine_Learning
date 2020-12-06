import get from 'lodash/get';
import getClues from '../db/services/getClues';
import { Express, Request, Response } from 'express';

export const clues = (app: Express) => {
  app.get('/clues', async (req: Request, res: Response) => {
    const seed = req.query.seed as string;
    const categories = await getClues.fullBoard(seed);
    res.json(categories);
  });
  return app;
};

export default clues;
