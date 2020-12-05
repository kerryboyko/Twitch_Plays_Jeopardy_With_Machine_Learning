/* eslint-disable no-console */
import connect from '../../connect';
import config from '../../../config';
import randomSeed from 'random-seed';
import omit from 'lodash/omit';
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

export const getCluesByCategory = async (categoryTitleOrId: string | number): Promise<JeopardyClue[] | null> => {
  const { db, close } = await connect(config.DB_URL, config.DB_NAME);
  const query = typeof categoryTitleOrId === 'number' ? { id: categoryTitleOrId } : { title: categoryTitleOrId };

  const category: JeopardyCategory | null = await db.collection('jeopardy_categories').findOne(query);

  if (category === null) {
    close();
    return null;
  }
  const clues: JeopardyClue[] | null = await db
    .collection('jeopardy_clues')
    .find({ 'category.id': category.id })
    .toArray();
  close();
  return stripDuplicateClues(clues);
};

const verifyCategory = (clues: JeopardyClue[]): boolean => {
  if (clues.length !== 5) {
    return false; // we only want categories of length 5.
  }
  if (clues.some((clue) => clue.answer === '' || clue.question === '' || clue.invalid_count !== null)) {
    return false;
  }
  return true;
};

export const getRandomCategories = async (
  count = 12,
  seed?: string
): Promise<Array<{ category: string; clues: JeopardyClue[] }>> => {
  const rand = seed ? randomSeed.create(seed) : randomSeed.create();
  const categories: Map<string, JeopardyClue[]> = new Map();
  while (categories.size < count) {
    const catId = rand(config.LARGEST_CATEGORY_ID) + 1;
    let category = await getCluesByCategory(catId);
    // some categories just will simply be null or incomplete;
    // we don't want to use them.
    if (category === null || category.length < 5) {
      continue;
    }
    // some categories have more than one set of questions. We need
    // to narrow it down to a specific set.
    if (category.length > 5) {
      const byAirdate = groupByAirdate(category);
      const airdates = Object.keys(byAirdate);
      const selectedAirdate = airdates[rand(Object.keys(byAirdate).length)];
      category = byAirdate[selectedAirdate];
      // again, only complete categories;
      if (category.length < 5) {
        continue;
      }
    }
    if (!verifyCategory(category)) {
      continue;
    }
    categories.set(
      category[0].category.title,
      category.map((c) => omit(c, ['_id']) as JeopardyClue)
    );
  }
  return Array.from(categories, ([title, clues]) => ({ category: title, clues: clueSorter(clues) }));
};

const getClues = {
  byCategory: getCluesByCategory,
  fullBoard: (seed?: string) => getRandomCategories(12, seed),
};
export default getClues;
