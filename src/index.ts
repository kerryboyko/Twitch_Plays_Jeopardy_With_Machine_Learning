import fs from 'fs';
import { getRandomCategories } from './db/services/getClues';

const writeOut = (fileName: string, data: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

const main = async () => {
  const board = await getRandomCategories(12, 'test seed');
  const board2 = await getRandomCategories(12, 'test seed 2');

  await writeOut('testBoard.json', JSON.stringify(board, null, 2));
  await writeOut('testBoard2.json', JSON.stringify(board2, null, 2));

  return;
};

main().then(() => console.log('done'));
