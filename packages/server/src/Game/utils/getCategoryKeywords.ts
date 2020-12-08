export const getCategoryKeywordList = (category: string): string[] => {
  return category.split(" ").sort((a, b) => b.length - a.length);
};

export const getCategoryKeywords = (
  categories: string[],
  hasBeenReversed = false
): Record<string, string> | never => {
  const keys: Record<string, string> = {};
  for (const category of categories) {
    let parsed = getCategoryKeywordList(category);
    // avoid duplicates
    while (keys[parsed[0]]) {
      parsed = parsed.slice(1);
      if (parsed.length === 0) {
        if (hasBeenReversed) {
          throw new Error(
            `This should never happen, but we can't get keywords for categories`
          );
        }
        // try reversing the order.
        return getCategoryKeywords(categories.reverse(), true);
      }
    }
    keys[parsed[0]] = category;
  }
  return keys;
};

export default getCategoryKeywords;
