import axios from 'axios';
import dotenv from 'dotenv';
import { JeopardyCategory, JeopardyClue, JServiceCategoryParams, JServiceClueParams } from '../types';

dotenv.config();

const JSERVICE_URL: string = process.env.JSERVICE_URL || 'error with dotenv';

export const getClues = async (params: JServiceClueParams = {}): Promise<JeopardyClue[]> => {
  const response = await axios.get(`${JSERVICE_URL}/api/clues`, { params });
  return response.data;
};

export const getCategories = async (
  params: JServiceCategoryParams = { offset: 0, count: 100 }
): Promise<JeopardyCategory[]> => {
  const url = `${JSERVICE_URL}/api/categories`;
  console.log(url);
  const response = await axios.get(url, { params });
  return response.data;
};

export default { getClues, getCategories };
