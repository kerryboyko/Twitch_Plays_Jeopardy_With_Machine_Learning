import fs from 'fs';
/* eslint-disable no-console */
import { getRandomCategories } from './appendCluesToCategories';

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
  const cats = await getRandomCategories(5);
  await writeOut('output.json', JSON.stringify(cats, null, 2));
};

main();
