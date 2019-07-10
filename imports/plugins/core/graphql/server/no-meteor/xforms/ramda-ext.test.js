import { renameKeys } from "./ramda-ext";

test("renameKeys renames keys in a map", () => {
  const input = { varA: 1, varB: 2 };
  expect(renameKeys({ varA: "varD" }, input)).toEqual({ varD: 1, varB: 2 });
});

test("renameKeys passes over missing keys", () => {
  const input = { varA: 1, varB: 2 };
  expect(renameKeys({ varF: "varD" }, input)).toEqual({ varA: 1, varB: 2 });
});
