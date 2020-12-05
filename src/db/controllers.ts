import { InsertWriteOpResult } from 'mongodb';
import connect from './connect';

const { DB_URL, DB_NAME } = process.env;

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
