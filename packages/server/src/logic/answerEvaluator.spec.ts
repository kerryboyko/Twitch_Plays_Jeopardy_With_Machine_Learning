import { answerEvaluator, answerEvaluatorSync } from "./answerEvaluator";

describe("answerEvaluator", () => {
  it("provides answer reports", async () => {
    expect(await answerEvaluator("oprah", "oprah")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", true],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(await answerEvaluator("oprah", "opera")).toEqual({
      final: false,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", null],
      ],
    });
    expect(await answerEvaluator("independence day", "4th of july")).toEqual({
      final: false,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", false],
      ],
    });
    expect(await answerEvaluator("henry viii", "henry viii")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", true],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(await answerEvaluator("henry viii", "henry tudor")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(await answerEvaluator("henry viii", "henry the 8th")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(await answerEvaluator("henry viii", "henry vi")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(await answerEvaluator("henry viii", "henry ford")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(await answerEvaluator("henry viii", "steve buschemi")).toEqual({
      final: false,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", false],
      ],
    });
  });
});

describe("answerEvaluatorSync", () => {
  it("provides answer reports", () => {
    expect(answerEvaluatorSync("oprah", "oprah")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", true],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(answerEvaluatorSync("oprah", "opera")).toEqual({
      final: false,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", null],
      ],
    });
    expect(answerEvaluatorSync("independence day", "4th of july")).toEqual({
      final: false,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", false],
      ],
    });
    expect(answerEvaluatorSync("henry viii", "henry viii")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", true],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(answerEvaluatorSync("henry viii", "henry tudor")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(answerEvaluatorSync("henry viii", "henry the 8th")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(answerEvaluatorSync("henry viii", "henry vi")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(answerEvaluatorSync("henry viii", "henry ford")).toEqual({
      final: true,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", true],
      ],
    });
    expect(answerEvaluatorSync("henry viii", "steve buschemi")).toEqual({
      final: false,
      strategyResults: [
        ["directStrategy", false],
        ["majorityConsonantsInRightOrderStrategy", false],
      ],
    });
  });
});
