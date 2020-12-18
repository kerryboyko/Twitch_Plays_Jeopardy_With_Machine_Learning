export const makeEnum = (
  key: string,
  ...values: string[]
): Record<string, string> =>
  values.reduce((pv, cv) => ({ ...pv, [cv]: `${key}.${cv}` }), {});

export default makeEnum;
