import getClues from "../db/services/getClues";
import saveCorrections from "../db/services/saveCorrections";
import answerEvaluator from "../logic/answerEvaluator";
import type { Express, Request, Response } from "express";
import type {
  JeopardyClue,
  CorrectionReport,
  CorrectionsBody,
} from "@jeopardai/types";

export const corrections = (app: Express) => {
  app.post("/corrections", async (req: Request, res: Response) => {
    const { id, corrections }: CorrectionsBody = req.body;
    try {
      const evaluation = await saveCorrections(id, corrections);
      res.sendStatus(200);
    } catch (e) {
      res.status(500).send(e);
    }
  });
  return app;
};

export default corrections;
