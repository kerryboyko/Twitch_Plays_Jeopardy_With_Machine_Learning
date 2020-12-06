import get from 'lodash/get';
import getClues from '../db/services/getClues';
import answerEvaluator from '../logic/answerEvaluator';
import type { Express, Request, Response } from 'express';
import type { JeopardyClue } from '../types';

interface EvaluateAnswersBody {
  id: number; // question id
  answers: [string, string][]; // array of [username, answer]
}
export const answers = (app: Express) => {
  app.post('/evaluate_answers', async (req: Request, res: Response) => {
    const { id, answers }: EvaluateAnswersBody = req.body;
    const clue: JeopardyClue | null = await getClues.byId(id);
    if (clue === null) {
      return res.status(500).send(`No record for Clue ID: ${id}`);
    }
    const evaluation = await Promise.all(answers.map(([player, provided]) => answerEvaluator(clue.answer, provided)));
    const merged = answers.map((answer, index) => [...answer, evaluation[index]]);
    res.json({ answer: clue.answer, evaluation: merged });
  });
  return app;
};

export default answers;
