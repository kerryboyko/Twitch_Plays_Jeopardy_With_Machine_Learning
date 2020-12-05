import axios from 'axios';
import { JeopardyCategory, JeopardyClue, JServiceCategoryParams, JServiceClueParams } from '../types';
import config from '../config';

export const getClues = async (params: JServiceClueParams = {}): Promise<JeopardyClue[]> => {
  const response = await axios.get(`${config.JSERVICE_URL}/api/clues`, { params });
  return response.data;
};

export const getCategories = async (
  params: JServiceCategoryParams = { offset: 0, count: 100 }
): Promise<JeopardyCategory[]> => {
  const response = await axios.get(`${config.JSERVICE_URL}/api/categories`, { params });
  return response.data;
};

export default { getClues, getCategories };
