import axios from 'axios';
import pick from 'lodash/pick';
import { JeopardyCategory, JeopardyCategoryRaw, JeopardyQuestion, JeopardyQuestionRaw } from '../../types';

const formatRawCategory = (raw: JeopardyCategoryRaw): JeopardyCategory => ({
  ...pick(raw, ['id', 'title']),
  createdAt: new Date(raw.created_at),
  updatedAt: new Date(raw.updated_at),
  cluesCount: raw.clues_count,
});

const formatJeopardyQuestion = (raw: JeopardyQuestionRaw): JeopardyQuestion => ({
  ...pick(raw, ['id', 'answer', 'question', 'value']),
  category: formatRawCategory(raw.category),
  airdate: new Date(raw.airdate),
  createdAt: new Date(raw.created_at),
  updatedAt: new Date(raw.updated_at),
  categoryId: raw.category_id,
  gameId: raw.game_id,
  invalidCount: raw.invalid_count,
});

export const getClues = async (): Promise<JeopardyQuestion[]> => {
  const response = await axios.get('http://jservice.io/api/clues');
  console.log(response.data.length)
  return response.data.map((rawQ: JeoparyQuestionRaw) => formatJeopardyQuestion(rawQ));
};

export default getClues;
