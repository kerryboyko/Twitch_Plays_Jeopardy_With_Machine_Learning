/* eslint-disable no-console */
import getClues from './api/jService';

const displayClues = async (): Promise<unknown> => {
  const clues = await getClues();
  console.log(clues);
  return clues;
};

const main = () => {
  let count = 10;
  displayClues();
  setInterval(() => console.log('---'), 5000);
  const timeout: NodeJS.Timeout = setInterval(() => {
    displayClues();
    count -= 1;
    if (count <= 0) {
      clearTimeout(timeout);
      console.log('END!!!');
    }
  }, 30000);
};

main();
