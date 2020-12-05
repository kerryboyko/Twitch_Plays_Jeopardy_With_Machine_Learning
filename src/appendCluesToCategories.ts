/* eslint-disable no-console */
import connect from './db/connect';
import config from './config';
import { JeopardyCategory, JeopardyClue } from './types';

const sortByAirdateAndQValue = (clues: JeopardyClue[]): Record<string, JeopardyClue[]> => {
  const output: Record<string, JeopardyClue[]> = {};
  for (const clue of clues) {
    if (!output[clue.airdate]) {
      output[clue.airdate] = [];
    }
    output[clue.airdate].push(clue);
  }
  for (const airdate of Object.keys(output)) {
    output[airdate] = output[airdate].sort((c1, c2) => c1.value - c2.value);
  }
  return output;
};

type CategorizedJeopardyClues = Record<string, Record<string, JeopardyClue[]>>;
export const getRandomCategories = async (count: number): Promise<CategorizedJeopardyClues> => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const categories = db.collection('jeopardy_categories');
  const samples: JeopardyCategory[] = await categories.aggregate([{ $sample: { size: count } }]).toArray();
  const clues = await Promise.all(
    samples.map((sample) => db.collection('jeopardy_clues').find({ 'category.id': sample.id }).toArray())
  );
  const output: CategorizedJeopardyClues = samples.reduce((accum: CategorizedJeopardyClues, sample, index) => {
    accum[sample.title] = sortByAirdateAndQValue(clues[index]);
    return accum;
  }, {});
  close();
  return output;
};

export default getRandomCategories;
