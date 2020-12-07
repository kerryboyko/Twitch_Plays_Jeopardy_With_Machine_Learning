/* eslint-disable no-console */
import connect from "../../connect";
import config from "../../../config";
import { CorrectionReport } from "../../../types";

export const dropCorrection = async (id: number) => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const result = await db.collection("corrections").findOneAndDelete({ id });
  close();
  return result;
};

export const saveCorrections = async (
  id: number,
  corrections: CorrectionReport[]
) => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const d = new Date();
  const clue = await db.collection("jeopardy_clues").findOne({ id });
  const canonical = clue.answer.toLowerCase();

  const reports = corrections.map((report) => ({ ...report, date: d }));
  const result = await db.collection("corrections").findOneAndUpdate(
    { id },
    {
      $set: { canonical },
      $push: {
        reports: { $each: reports },
      },
    },
    { upsert: true }
  );
  close();
  return result;
};

export const getCorrections = async (id: number) => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);

  const result = await db.collection("corrections").findOne({ id });
  close();
  return result;
};

export default saveCorrections;
