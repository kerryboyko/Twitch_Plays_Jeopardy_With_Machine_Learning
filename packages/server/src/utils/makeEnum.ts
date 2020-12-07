export const makeEnum = (key: string, ...values: string[]) =>
  values.reduce((pv, cv) => ({ ...pv, [cv]: `${key}.${cv}` }), {});

export default makeEnum;
