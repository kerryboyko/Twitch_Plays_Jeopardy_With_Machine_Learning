import { getText } from "./connectClient";

test("getText gets the text", async () => {
  const text = await getText();
  expect(text).toMatchSnapshot();
});
