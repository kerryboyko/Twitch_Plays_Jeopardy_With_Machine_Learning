// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pickOneAtRandom = <T extends any>(arr: T[]): T => {
  const l = arr.length;
  const selection = Math.floor(Math.random() * l);
  return arr[selection];
};

export default pickOneAtRandom;
