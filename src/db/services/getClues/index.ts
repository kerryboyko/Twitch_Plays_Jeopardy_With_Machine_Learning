/* eslint-disable no-console */
import connect from '../../connect';
import config from '../../../config';
import randomSeed from 'random-seed';
import { JeopardyCategory, JeopardyClue } from '../../../types';

const uidClue = (clue: JeopardyClue) => `${clue.question}||${clue.answer}`;

export const stripDuplicateClues = (clues: JeopardyClue[]): JeopardyClue[] => {
  const uniques = new Set<string>([]);
  return clues.filter((clue) => {
    const clueUid = uidClue(clue);
    if (uniques.has(clueUid)) {
      return false;
    }
    uniques.add(clueUid);
    return true;
  });
};

const clueSorter = (clues: JeopardyClue[]): JeopardyClue[] => clues.sort((c1, c2) => c1.value - c2.value);

export const groupByAirdate = (clues: JeopardyClue[]): Record<string, JeopardyClue[]> => {
  const byAirdate: Record<string, JeopardyClue[]> = {};
  for (const clue of clues) {
    if (!byAirdate[clue.airdate]) {
      byAirdate[clue.airdate] = [];
    }
    byAirdate[clue.airdate].push(clue);
  }
  return byAirdate;
};

export const getCluesByCategoryName = async (categoryName: string): Promise<Record<string, JeopardyClue[] | null>> => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const category: JeopardyCategory | null = await db.collection('jeopardy_categories').findOne({ title: categoryName });
  if (category === null) {
    close();
    return {
      [categoryName]: null,
    };
  }
  const clues: JeopardyClue[] | null = await db
    .collection('jeopardy_clues')
    .find({ 'category.id': category.id })
    .toArray();
  close();
  if (clues === null) {
    return {
      [categoryName]: [],
    };
  }
  return {
    [categoryName]: clues,
  };
};

export const getCategoryById = async (id: number): Promise<JeopardyCategory | null> => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const category: JeopardyCategory | null = await db.collection('jeopardy_categories').findOne({ id });
  close();
  return category;
};

export const getRandomCategories = async (count = 6, seed?: string) => {
  const rand = seed ? randomSeed.create(seed) : randomSeed.create();
  const categories: JeopardyCategory[] = [];
  while (categories.length < count) {
    const catId = rand(config.LARGEST_CATEGORY_ID) + 1;
    const category = await getCategoryById(catId);
    if (category !== null) {
      categories.push(category);
    }
  }
  return categories;
};

const getClues = {
  byCategoryName: getCluesByCategoryName,
};
export default getClues;
