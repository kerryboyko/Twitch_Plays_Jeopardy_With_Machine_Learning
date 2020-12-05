import { stripDuplicateClues, groupByAirdate, getRandomCategories } from '.';
import { JeopardyClue } from '../../../types';
import { duplicateClues, starwars } from './getClues.mocks';

test('stripDuplicateClues', () => {
  expect(duplicateClues).toHaveLength(10);
  expect(stripDuplicateClues(duplicateClues)).toHaveLength(5);
});

test('groupByAirdate', () => {
  const groupedSW = groupByAirdate(starwars as JeopardyClue[]);
  expect(Object.keys(groupedSW).sort()).toEqual([
    '1998-04-29T12:00:00.000Z',
    '1999-02-23T12:00:00.000Z',
    '2006-01-05T12:00:00.000Z',
    '2006-11-17T12:00:00.000Z',
    '2007-05-29T12:00:00.000Z',
  ]);
});

test('getRandomCategories', async () => {
  const cats = await getRandomCategories(6, 'this is a seed');
  expect(cats.map(({ id, title }) => [id, title])).toEqual([
    [14639, 'the comedic calvin coolidge'],
    [11898, 'when politicians speak'],
    [11595, 'sex & the kitty'],
    [15890, 'text me'],
    [5639, 'books about presidents'],
    [16622, 'the rum diaries'],
  ]);
});
