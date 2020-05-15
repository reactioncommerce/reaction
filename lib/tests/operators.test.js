import operators from "../operators.js";

test("eq operator returns true if second argument is equal to first argument", () => {
  const result = operators.eq("1", "1");
  expect(result).toBe(true);
});

test("eq operator returns false if second argument is not equal to first argument", () => {
  const result = operators.eq("1", "2");
  expect(result).toBe(false);
});

test("ne operator returns true if second argument is not equal to first argument", () => {
  const result = operators.ne("1", "1");
  expect(result).toBe(false);
});

test("ne operator returns false if second argument is equal to first argument", () => {
  const result = operators.ne("1", "2");
  expect(result).toBe(true);
});

test("gt operator returns true if second argument is greater than first argument", () => {
  const result = operators.gt(2, 1);
  expect(result).toBe(true);
});

test("gt operator returns false if second argument is not greater than first argument", () => {
  const result = operators.gt(1, 2);
  expect(result).toBe(false);
});

// This test also verifies that the test is case insensitive
test("match operator returns true if first argument is a regex match for the regex in the second argument", () => {
  const paragraph = "The quick brown fox jumps over the lazy dog. It barked.";
  const regex = /[A-Z]/g;
  const result = operators.match(paragraph, regex);
  expect(result).toBe(true);
});

test("match operator returns false if first argument is not a regex match for the regex in the second argument", () => {
  const paragraph = "The quick brown fox jumps over the lazy dog. It barked.";
  const regex = /[0-9]/g;
  const result = operators.match(paragraph, regex);
  expect(result).toBe(false);
});

test("includes operator returns true if second argument is in first argument", () => {
  const result = operators.includes([1, 2, 3, 4], 1);
  expect(result).toBe(true);
});

test("includes operator returns false if second argument is not in first argument", () => {
  const result = operators.includes([1, 2, 3, 4], 12);
  expect(result).toBe(false);
});

test("includes operator throws error if passed argument of wrong type", () => {
  expect(() => operators.includes("bloop", 12)).toThrow(TypeError);
});
