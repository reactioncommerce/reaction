import importAsString from "../lib/importAsString.js";

test("imports a string from a relative path", () => {
  const result = importAsString("./importAsString.test.txt");
  expect(result).toBe("IMPORTED A STRING\n");
});

test("imports a string from a path in a package", () => {
  const result = importAsString("is-docker/readme.md");
  expect(result.slice(0, 11)).toBe("# is-docker");
});
