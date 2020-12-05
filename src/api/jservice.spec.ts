import jService from './jservice';

describe('jService', () => {
  describe('jService.getClues', () => {
    it('gets clues', async () => {
      const result = await jService.getClues();
      expect(result).toHaveLength(100);
      // don't need to test all 100
      result.slice(0, 10).forEach((clue) => {
        expect(Object.keys(clue).sort()).toEqual(
          [
            'id',
            'answer',
            'question',
            'value',
            'airdate',
            'created_at',
            'updated_at',
            'category_id',
            'game_id',
            'invalid_count',
            'category',
          ].sort()
        );
        expect(Object.keys(clue.category).sort()).toEqual(
          ['id', 'title', 'created_at', 'updated_at', 'clues_count'].sort()
        );
      });
    });
  });
  describe('jService.getCategories', () => {
    it('gets categories', async () => {
      const result = await jService.getCategories({ offset: 0, count: 10 });
      expect(result.length).toBe(10);
      expect(Object.keys(result[0]).sort()).toEqual(['clues_count', 'id', 'title'].sort());
    });
  });
});
