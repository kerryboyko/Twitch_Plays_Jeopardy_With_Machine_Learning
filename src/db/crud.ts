import dotenv from 'dotenv';
import { InsertWriteOpResult } from 'mongodb';
import connect from './connect';

dotenv.config();

const DB_URL = process.env.DB_URL || 'db-url-undefined';
const DB_NAME = process.env.DB_NAME || 'db-name-undefined';

export const insertDocuments = async <T>(
  collectionName: string,
  documents: T[]
): Promise<InsertWriteOpResult<unknown & { _id: unknown }>> => {
  const { db, close } = await connect(DB_URL, DB_NAME);
  const collection = db.collection(collectionName);
  try {
    const result = await collection.insertMany(documents);
    close();
    return result;
  } catch (err) {
    close();
    throw new Error(err);
  }
};

export default { insertDocuments };
