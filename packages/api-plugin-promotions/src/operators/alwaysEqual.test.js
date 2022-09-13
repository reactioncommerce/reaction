import alwaysEqual from "./alwaysEqual.js";

test("operator returns always equal", () => {
  expect(alwaysEqual()).toBeTruthy();
});
