import getSlug from "./getSlug.js";

it("should slugify a latin text", () => {
  const text = "This is a title";
  const slugified = getSlug(text);
  expect(slugified).toEqual("this-is-a-title");
});

it("should slugify a latin text with / (backslash)", () => {
  const text = "men/jacket";
  const slugified = getSlug(text);
  expect(slugified).toEqual("men/jacket");
});
