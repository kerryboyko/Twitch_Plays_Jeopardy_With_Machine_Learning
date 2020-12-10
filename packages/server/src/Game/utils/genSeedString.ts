export const genSeedString = (): string => {
  return Math.random().toString(36).substring(4, 10);
};

export default genSeedString;
