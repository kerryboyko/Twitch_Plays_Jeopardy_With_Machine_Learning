import { directStrategy, thirdSubstringStrategy, majorityConsonantsInRightOrderStrategy } from './strategies';

describe('strategies', () => {
  describe('direct strategy', () => {
    it('matches a direct match', () => {
      expect(directStrategy('oprah', 'oprah')).toBe(true);
      expect(directStrategy('oprah', 'opera')).toBe(false);
      expect(directStrategy('independence day', '4th of july')).toBe(false); // false negative
    });
  });
  describe('third substring strategy', () => {
    it('matches if there is one substring at least 1/3rd of the length of the canonical answer in the provided answer', () => {
      expect(thirdSubstringStrategy('oprah', 'oprah')).toBe(null);
      expect(thirdSubstringStrategy('oprah', 'opera')).toBe(null);
      expect(thirdSubstringStrategy('henry viii', 'henry viii')).toBe(true);
      expect(thirdSubstringStrategy('henry viii', 'henry tudor')).toBe(true);
      expect(thirdSubstringStrategy('henry viii', 'henry the 8th')).toBe(true);
      expect(thirdSubstringStrategy('henry viii', 'henry vi')).toBe(true); // false positive
      expect(thirdSubstringStrategy('henry viii', 'henry ford')).toBe(true); // false positive
      expect(thirdSubstringStrategy('henry viii', 'steve buschemi')).toBe(false);
      expect(thirdSubstringStrategy('independence day', '4th of july')).toBe(false); // false negative
    });
  });
  describe('majority consonants in right order strategy', () => {
    it('matches if the majority of the consonants are in the right order', () => {
      expect(majorityConsonantsInRightOrderStrategy('oprah', 'oprah')).toBe(true);
      expect(majorityConsonantsInRightOrderStrategy('oprah', 'opera')).toBe(null);
      expect(majorityConsonantsInRightOrderStrategy('henry viii', 'henry viii')).toBe(true);
      expect(majorityConsonantsInRightOrderStrategy('henry viii', 'henry tudor')).toBe(true);
      expect(majorityConsonantsInRightOrderStrategy('henry viii', 'henry the 8th')).toBe(true);
      expect(majorityConsonantsInRightOrderStrategy('henry viii', 'henry vi')).toBe(true); // false positive
      expect(majorityConsonantsInRightOrderStrategy('henry viii', 'henry ford')).toBe(true); // false positive
      expect(majorityConsonantsInRightOrderStrategy('henry viii', 'steve buschemi')).toBe(false);
      expect(majorityConsonantsInRightOrderStrategy('independence day', '4th of july')).toBe(false); // false negative
    });
  });
});
