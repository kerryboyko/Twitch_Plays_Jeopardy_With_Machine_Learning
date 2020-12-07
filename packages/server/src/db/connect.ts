import mongodb from 'mongodb';

export const connect = (
  url: string,
  dbName: string
): Promise<{ db: mongodb.Db; close: mongodb.MongoClient['close'] }> =>
  new Promise((resolve, reject) => {
    const client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    client.connect((err: mongodb.MongoError) => {
      if (err) {
        return reject(err);
      }
      const db = client.db(dbName);
      const close = () => client.close();
      resolve({
        db,
        close,
      });
    });
  });

export default connect;
