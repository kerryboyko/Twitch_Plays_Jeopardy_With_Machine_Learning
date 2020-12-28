import strategies from "./strategies";

interface StrategyReport {
  final: boolean;
  strategyResults: [string, boolean | null][]; // [strategy name, strategy result]
}

export const answerEvaluatorSync = (
  canonical: string,
  provided: string
): StrategyReport => {
  const formattedCanonical = canonical
    .toLowerCase()
    .split(" ")
    .filter((x) => x !== "")
    .join(" ")
    .replace(/[^\w\s!?]/g, ""); // removes punctuation, hyphens, etc - everything but letters, numbers, spaces.
  const formattedProvided = provided
    .toLowerCase()
    .split(" ")
    .slice(2) // removes "What is, who is, etc"
    .filter((x) => x !== "")
    .join(" ")
    .replace(/[^\w\s!?]/g, ""); // removes punctuation marks, etc.

  const strategyResults = Object.entries(strategies).map(([stratName, strat]): [
    string,
    boolean | null
  ] => [stratName, strat(formattedCanonical, formattedProvided)]);
  const final = strategyResults.some(([_name, result]) => result === true);
  return { final, strategyResults };
};

// This is async because eventually we'll be getting tensorflow in here
export const answerEvaluator = async (
  canonical: string,
  provided: string
): Promise<StrategyReport> => {
  const output = answerEvaluatorSync(canonical, provided);
  return output;
};

export default answerEvaluator;
