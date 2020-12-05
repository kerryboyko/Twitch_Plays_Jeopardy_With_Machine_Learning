import { connect } from './db/connect';
import config from './config';

import fs from 'fs';
// /* eslint-disable no-console */
// import { getCluesByCategoryName } from './db/services/getClues';

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

// const main = async () => {
//   const data = await getCluesByCategoryName('star wars');
//   await writeOut('starwars.json', JSON.stringify(data, null, 2));
// };

// main();
