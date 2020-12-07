import get from 'lodash/get';
import getClues from '../db/services/getClues';
import answerEvaluator from '../logic/answerEvaluator';
import type { Express, Request, Response } from 'express';
import type { JeopardyClue, CorrectionReport } from '../types';

interface CorrectionsBody {
  id: number; // question id
  corrections: CorrectionReport[]; // [reporter, providedAnswer, typeOfCorrection];
}
export const corrections = (app: Express) => {
  app.post('/corrections', async (req: Request, res: Response) => {
    const { id, corrections }: correctionsBody = req.body;
    try {
      const evaluation = await saveCorrections(id, corrections);
      res.sendStatus(200);
    } catch (e) {
      res.status(500).send(e);
    }
  });
  return app;
};

export default Corrections;
