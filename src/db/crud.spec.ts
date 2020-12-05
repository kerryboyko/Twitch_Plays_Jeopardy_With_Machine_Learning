import dotenv from 'dotenv';
import { insertDocuments } from './crud';

dotenv.config();

describe('Create Read Update Delete methods (crud)', () => {
  describe('insertDocuments', () => {
    it('inserts documents', async () => {
      const testObjects = [{ a: 1 }, { a: 2 }, { a: 3 }];
      const result = await insertDocuments<Record<string, number>>('testCollection', testObjects);
      expect(result.insertedCount).toBe(3);
      expect(result.ops).toEqual([
        {
          _id: result.ops[0]._id,
          a: 1,
        },
        {
          _id: result.ops[1]._id,
          a: 2,
        },
        {
          _id: result.ops[2]._id,
          a: 3,
        },
      ]);
      expect(result.result).toEqual({ n: 3, ok: 1 });
    });
  });
});
