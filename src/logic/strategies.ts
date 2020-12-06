/* Strategies for determining if an answer is correct */
export type Strategy = (canonical: string, provided: string) => boolean;

// direct comparison. "benjamin franklin" === 'benjamin franklin'
export const directStrategy: Strategy = (c, p) => c === p;

// 33% substring. "Henry Tudor" === "Henry VIII" BUT "Henry Tudor" !== "Henry Ford"
export const thirdSubstringStrategy: Strategy = (c, p) => {
  const third = Math.ceil(p.length / 3);
  let cursor = 0;
  while (cursor + third <= p.length) {
    if (c.includes(p.substring(cursor, cursor + third))) {
      return true;
    }
  }
  return false;
};

export const mostConsInRightOrderStrategy: Strategy (c, p) => {  
  const strippedC = c.split(' ').filter(w => w.length > 3).join('').replace(/[aeiou]/ig,'');
  const strippedP = p.split(' ').filter(w => w.length > 3).join('').replace(/[aeiou]/ig,'');
  let cursor = 0;
  const half = Math.ceil(strippedC.length /2);
  while(cursor + half <= strippedC.length){
    if(strippedP.includes(strippedP.substring(cursor, cursor + half))){
      return true;
    }
    cursor += 1;
  }
  return false;  
}

export default strategies = [directStrategy, mostConsInRightOrderStrategy, thirdSubstringStrategy]