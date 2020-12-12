import { getCategoryKeywords } from "./getCategoryKeywords";
import testBoard2 from "../../db/services/getClues/mocks/testBoard2.json";

const tbCategories = testBoard2.map(c => c.category);
test("getCategoryKeywords", () => {
  expect(getCategoryKeywords(tbCategories)).toEqual({
    amphibians: "amphibians",
    dawn: "dawn",
    emmys: "the 1950 emmys",
    europe: "europe",
    gangsters: "gangsters",
    international: "international cuisine",
    losing: "the losing ticket",
    make: "make room",
    nonmusical: "nonmusical mtv",
    shout: "one-word shout outs",
    religion: "true religion",
    twitters: "the author twitters",
    weapons: "weapons"
  });
  expect(getCategoryKeywords(tbCategories.concat("europe train"))).toEqual({
    amphibians: "amphibians",
    dawn: "dawn",
    emmys: "the 1950 emmys",
    europe: "europe",
    gangsters: "gangsters",
    international: "international cuisine",
    losing: "the losing ticket",
    make: "make room",
    nonmusical: "nonmusical mtv",
    shout: "one-word shout outs",
    religion: "true religion",
    twitters: "the author twitters",
    weapons: "weapons",
    train: "europe train"
  });
  expect(
    getCategoryKeywords(tbCategories.concat("europe train").reverse())
  ).toEqual({
    amphibians: "amphibians",
    dawn: "dawn",
    emmys: "the 1950 emmys",
    europe: "europe",
    gangsters: "gangsters",
    international: "international cuisine",
    losing: "the losing ticket",
    make: "make room",
    nonmusical: "nonmusical mtv",
    shout: "one-word shout outs",
    religion: "true religion",
    twitters: "the author twitters",
    weapons: "weapons",
    train: "europe train"
  });
});
