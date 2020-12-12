import { Application, Request, Response } from "express";
import getClues from "../db/services/getClues";

export const clues = (app: Application): Application => {
  app.get("/clues", async (req: Request, res: Response) => {
    const seed = req.query.seed as string;
    const categories = await getClues.fullBoard(seed);
    res.json(categories);
  });
  return app;
};

export default clues;
