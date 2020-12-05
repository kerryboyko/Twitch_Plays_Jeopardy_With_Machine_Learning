import { InsertWriteOpResult } from 'mongodb';
import connect from './connect';
import config from '../config';

// eslint-disable-next-line no-console
console.log(config);

const { DB_URL, DB_NAME } = config;

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
