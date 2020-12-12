import { Express, Request, Response } from "express";
import saveCorrections from "../db/services/saveCorrections";
import { CorrectionsBody } from "../types";

export const handleCorrections = (app: Express): Express => {
  app.post("/corrections", async (req: Request, res: Response) => {
    const { id, corrections }: CorrectionsBody = req.body;
    try {
      await saveCorrections(id, corrections);
      res.sendStatus(200);
    } catch (e) {
      res.status(500).send(e);
    }
  });
  return app;
};

export default handleCorrections;
