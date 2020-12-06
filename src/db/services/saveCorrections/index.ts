/* eslint-disable no-console */
import connect from '../../connect';
import config from '../../../config';
import { JeopardyClue } from '../../../types';

export interface CorrectionReport {
  reporter: string; // username of reporter;
  provided: string; // the answer that was provided
  type: string; // typeof report - thinking this might be enum 'NOT_WRONG' | 'NOT_RIGHT' | 'INVALID_CLUE' | 'OUTDATED_CLUE'
  date?: Date;
}

export const dropCorrection = async (id: number) => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const result = await db.collection('corrections').findOneAndDelete({ id });
  close();
  return result;
};

export const saveCorrections = async (id: number, canonical: string, reports: CorrectionReport[]) => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const d = new Date();
  reports = reports.map((report) => ({ ...report, date: d }));
  const result = await db.collection('corrections').findOneAndUpdate(
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

  const result = await db.collection('corrections').findOne({ id });
  close();
  return result;
};

export default saveCorrections;
