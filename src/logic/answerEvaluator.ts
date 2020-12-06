import strategies from './strategies';

// This is async because eventually we'll be getting tensorflow in here
const answerEvaluator = async (canonical: string, provided: string): Promise<boolean> => {
  canonical = canonical.toLowerCase().split(' ').trim().join(' ');
  provided = provided.toLowerCase().split(' ').trim().join(' ');
  if (strategies.some((strategy) => strategy(canonical, provided))) {
    return true;
  }
  return false;
};

export default answerEvaluator;
