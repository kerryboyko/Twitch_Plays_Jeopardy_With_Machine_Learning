import { saveCorrections, getCorrections, dropCorrection, CorrectionReport } from '.';
import { JeopardyClue } from '../../../types';

const oprahq = {
  _id: '5fcb54d24f6d209fc249df10',
  id: 22478,
  answer: 'Oprah',
  question: "In 1998 Texas cattlemen had a beef with this talk show queen, but the jury didn't swallow it",
  value: 100,
  airdate: '1998-04-29T12:00:00.000Z',
  created_at: '2014-02-11T22:59:14.603Z',
  updated_at: '2014-02-11T22:59:14.603Z',
  category_id: 2350,
  game_id: null,
  invalid_count: null,
  category: {
    id: 2350,
    title: 'star wars',
    created_at: '2014-02-11T22:59:14.511Z',
    updated_at: '2014-02-11T22:59:14.511Z',
    clues_count: 25,
  },
};

const testCorrections: CorrectionReport[] = [
  { reporter: 'alpha', provided: 'oprah winfrey', type: 'NOT_WRONG' },
  { reporter: 'beta', provided: 'oprah gail winfrey', type: 'NOT_WRONG' },
  { reporter: 'gamma', provided: 'oprah winfrey', type: 'NOT_WRONG' },
  { reporter: 'delta', provided: 'oprah winfrey', type: 'NOT_WRONG' },
  { reporter: 'epsilon', provided: 'oprah winfrey', type: 'NOT_WRONG' },
  { reporter: 'theta', provided: 'opera', type: 'NOT_RIGHT' },
];

test('saveCorrections', async () => {
  await dropCorrection(22478);
  await saveCorrections(oprahq.id, oprahq.answer.toLowerCase(), testCorrections);

  const retrieved = await getCorrections(oprahq.id);
  expect(retrieved.id).toBe(22478);
  expect(retrieved.canonical).toBe('oprah');
  expect(retrieved.reports).toHaveLength(6);
  for (const report of retrieved.reports) {
    expect(Object.keys(report).sort()).toEqual(['date', 'provided', 'reporter', 'type'].sort());
  }
  expect(retrieved.reports.map((r: CorrectionReport) => r.reporter)).toEqual([
    'alpha',
    'beta',
    'gamma',
    'delta',
    'epsilon',
    'theta',
  ]);
  await saveCorrections(
    oprahq.id,
    oprahq.answer.toLowerCase(),
    testCorrections.map((c: CorrectionReport) => ({ ...c, reporter: c.reporter.split('').reverse().join('') }))
  );

  const secondRetrieved = await getCorrections(oprahq.id);
  expect(secondRetrieved.id).toBe(22478);
  expect(secondRetrieved.canonical).toBe('oprah');
  expect(secondRetrieved.reports).toHaveLength(12);
  for (const report of secondRetrieved.reports) {
    expect(Object.keys(report).sort()).toEqual(['date', 'provided', 'reporter', 'type'].sort());
  }
  expect(secondRetrieved.reports.map((r: CorrectionReport) => r.reporter)).toEqual([
    'alpha',
    'beta',
    'gamma',
    'delta',
    'epsilon',
    'theta',
    'ahpla',
    'ateb',
    'ammag',
    'atled',
    'nolispe',
    'ateht',
  ]);
});
