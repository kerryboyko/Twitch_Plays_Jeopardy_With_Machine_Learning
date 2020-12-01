/* eslint-disable camelcase */
export interface JeopardyCategoryRaw {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  clues_count: number;
}

export interface JeopardyCategory {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  cluesCount: number;
}

export interface JeopardyQuestionRaw {
  id: number;
  answer: string;
  question: string;
  value: number;
  airdate: string; // '1985-02-08T12:00:00.000Z';
  created_at: string; // '2014-02-11T22:47:18.829Z';
  updated_at: string; // '2014-02-11T22:47:18.829Z';
  category_id: number;
  game_id: null | unknown;
  invalid_count: null | number;
  category: JeopardyCategoryRaw;
}

export interface JeopardyQuestion extends Pick<JeopardyQuestionRaw, 'id' | 'answer' | 'question' | 'value'> {
  airdate: Date;
  createdAt: Date;
  updatedAt: Date;
  categoryId: number;
  gameId: null | unknown;
  invalidCount: null | unknown;
  category: JeopardyCategory;
}
