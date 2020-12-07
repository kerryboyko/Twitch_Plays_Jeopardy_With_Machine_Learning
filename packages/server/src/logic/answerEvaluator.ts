import strategies from './strategies';

interface StrategyReport {
  final: boolean;
  strategyResults: [string, boolean | null][]; // [strategy name, strategy result]
}
// This is async because eventually we'll be getting tensorflow in here
export const answerEvaluator = async (canonical: string, provided: string): Promise<StrategyReport> => {
  const output = answerEvaluatorSync(canonical, provided);
  return output;
};

export const answerEvaluatorSync = (canonical: string, provided: string): StrategyReport => {
  const formattedCanonical = canonical
    .toLowerCase()
    .split(' ')
    .filter((x) => x !== '')
    .join(' ');
  const formattedProvided = provided
    .toLowerCase()
    .split(' ')
    .filter((x) => x !== '')
    .join(' ');

  const strategyResults = Object.entries(strategies).map(([stratName, strat]): [string, boolean | null] => [
    stratName,
    strat(formattedCanonical, formattedProvided),
  ]);
  const final = strategyResults.some(([_name, result]) => result === true);
  return { final, strategyResults };
};

export default answerEvaluator;