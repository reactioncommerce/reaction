import getMongoSort from "./getMongoSort.js";

test("default sort is by _id, ascending", () => {
  expect(getMongoSort()).toEqual({ _id: 1 });
});

test("by _id, ascending", () => {
  expect(getMongoSort({ sortBy: "_id", sortOrder: "asc" })).toEqual({ _id: 1 });
});

test("by _id, descending", () => {
  expect(getMongoSort({ sortBy: "_id", sortOrder: "desc" })).toEqual({ _id: -1 });
});

test("by name then _id, ascending", () => {
  expect(getMongoSort({ sortBy: "name", sortOrder: "asc" })).toEqual({ name: 1, _id: 1 });
});

test("by name then _id, descending", () => {
  expect(getMongoSort({ sortBy: "name", sortOrder: "desc" })).toEqual({ name: -1, _id: -1 });
});
