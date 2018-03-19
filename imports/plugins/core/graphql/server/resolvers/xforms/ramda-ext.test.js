import { renameKeys } from "./ramda-ext";

test("renameKeys renames keys in a map", () => {
  const input = { a: 1, b: 2 };
  expect(renameKeys({ a: "d" }, input)).toEqual({ d: 1, b: 2 });
});

test("renameKeys passes over missing keys", () => {
  const input = { a: 1, b: 2 };
  expect(renameKeys({ f: "d" }, input)).toEqual({ a: 1, b: 2 });
});
