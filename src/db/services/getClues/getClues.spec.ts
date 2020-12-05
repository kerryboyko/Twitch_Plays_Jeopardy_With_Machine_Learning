import { groupByAirdate, getRandomCategories, stripDuplicateClues } from '.';
import { JeopardyClue } from '../../../types';
import starwars from './mocks/starwars.json';
import testBoard from './mocks/testBoard.json';
import duplicateClues from './mocks/duplicateClues.json';

test('stripDuplicateClues', () => {
  expect(duplicateClues).toHaveLength(10);
  expect(stripDuplicateClues(duplicateClues)).toHaveLength(5);
});

test('groupByAirdate', () => {
  const groupedSW = groupByAirdate(starwars['star wars'] as JeopardyClue[]);
  expect(Object.keys(groupedSW).sort()).toEqual([
    '1998-04-29T12:00:00.000Z',
    '1999-02-23T12:00:00.000Z',
    '2006-01-05T12:00:00.000Z',
    '2006-11-17T12:00:00.000Z',
    '2007-05-29T12:00:00.000Z',
  ]);
});

test('getRandomCategories', async () => {
  const board = await getRandomCategories(12, 'test seed');
  expect(board).toEqual(testBoard);
});
