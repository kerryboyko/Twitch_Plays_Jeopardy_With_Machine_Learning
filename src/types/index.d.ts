/* eslint-disable camelcase */
export interface JeopardyCategory {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
  clues_count: number;
}

/* Yes, we all know that Jeopardy refers to these as "answers" or "clues" */
export interface JeopardyClue {
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
  category: JeopardyCategory;
}

export interface JServiceClueParams {
  value?: number;
  category?: number;
  min_date?: Date;
  max_date?: Date;
  offset?: number;
}

export interface JServiceCategoryParams {
  count?: number;
  offset?: number;
}
