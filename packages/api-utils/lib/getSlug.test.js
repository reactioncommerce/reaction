import getSlug from "./getSlug.js";

const allowedCharacters = "a-zA-Z0-9-/";

it("should slugify a latin text", () => {
  const text = "This is a title";
  const slugified = getSlug(text);
  expect(slugified).toEqual("this-is-a-title");
});

it("should slugify a latin text with / (backslash)", () => {
  const text = "men/jacket";
  const slugified = getSlug(text, allowedCharacters);
  expect(slugified).toEqual("men/jacket");
});

it("should slugify with a mix of slash and others", () => {
  const text = "extremely tall men/jacket";
  const slugified = getSlug(text, allowedCharacters);
  expect(slugified).toEqual("extremely-tall-men/jacket");
});
