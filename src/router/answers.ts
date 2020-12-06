import get from 'lodash/get';
import getClues from '../db/services/getClues';
import answerEvaluator from '../logic/answerEvaluator';
import { Express, Request, Response } from 'express';

interface EvaluateAnswersBody {
  id: number; // question id
  answers: [string, string][] // array of [username, answer]
}
export const answers = (app: Express) => {
  app.post('/evaluate_answers', async (req: Request, res: Response) => {
    const {id, answers}: EvaluateAnswersBody = request.body;
    const clue = await getClues.byId(id);
    const evaluation = await Promise.all(answers.map(await ([player, provided]) => {
      const result = answerEvaluator(clue.answer, provided);
      return [player, provided, result]; 
    }))
    res.json({answer: clue.answer, evaluation})
  });
  return app;
};

export default clues;
