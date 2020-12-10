import genSeedString from "./genSeedString";

describe("genSeedString", () => {
  it("generates a seed string", () => {
    const seed = genSeedString();
    expect(typeof seed).toBe("string");
    expect(seed.length).toBe(6);
  });
});
