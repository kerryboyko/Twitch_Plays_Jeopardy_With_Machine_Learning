import { J_VALS, DJ_VALS } from "./constants";

test("constants", () => {
  expect(J_VALS).toEqual([200, 400, 600, 800, 1000]);
  expect(DJ_VALS).toEqual([400, 800, 1200, 1600, 2000]);
});
