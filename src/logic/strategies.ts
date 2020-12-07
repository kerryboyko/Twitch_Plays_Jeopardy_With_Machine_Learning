/* Strategies for determining if an answer is correct */
export type Strategy = (canonical: string, provided: string) => boolean | null;

// direct comparison. "benjamin franklin" === 'benjamin franklin'
export const directStrategy: Strategy = (c, p) => c === p;

// 33% substring. "Henry Tudor" === "Henry VIII" BUT "Henry Tudor" !== "Henry Ford"
export const thirdSubstringStrategy: Strategy = (c, p) => {
  const third = Math.ceil(p.length / 3);
  if (third < 3) {
    return null; // null responses are falsy, but are distinct from 'false'
  }
  let cursor = 0;
  while (cursor + third <= p.length || cursor > 30) {
    if (c.includes(p.substring(cursor, cursor + third))) {
      return true;
    }
    cursor += 1;
  }
  return false;
};

export const majorityConsonantsInRightOrderStrategy: Strategy = (c, p) => {
  const strippedC = c
    .split(' ')
    .filter((w) => w.length > 3)
    .join('')
    .replace(/[aeiou]/gi, '');
  const strippedP = p
    .split(' ')
    .filter((w) => w.length > 3)
    .join('')
    .replace(/[aeiou]/gi, '');
  console.log(strippedC, strippedP);
  if (strippedC.length < 3 || strippedP.length < 3) {
    return null; // not enough data to use strategy;
  }
  let cursor = 0;
  const half = Math.ceil(strippedC.length / 2);
  while (cursor + half <= strippedP.length) {
    console.log(strippedP.substring(cursor, cursor + half));
    if (strippedC.includes(strippedP.substring(cursor, cursor + half))) {
      console.log(`sc: ${strippedC}, sp: ${strippedP}, match ${strippedP.substring(cursor, cursor + half)}`);
      return true;
    }
    cursor += 1;
  }
  return false;
};

// for right now we'll just hardcode these three strategies.  We'll add tensorflow later.
const strategies: Strategy[] = [directStrategy, majorityConsonantsInRightOrderStrategy, thirdSubstringStrategy];

export default strategies;
