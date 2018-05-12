import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

let mockCursor;
beforeEach(() => {
  mockCursor = getFakeMongoCursor("Test", new Array(100));
});

test("with neither first nor last limits to first 50", async () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(51));
  const result = await applyPaginationToMongoCursor(mockCursor, undefined, 100);
  expect(result).toEqual({
    hasNextPage: true,
    hasPreviousPage: null
  });
  expect(mockCursor.limit.mock.calls).toEqual([[51], [50]]);
  expect(mockCursor.skip).not.toHaveBeenCalled();
});

test("with both first and last, throws error", () => {
  expect(applyPaginationToMongoCursor(mockCursor, { first: 1, last: 1 }, 100)).rejects.toThrowErrorMatchingSnapshot();
});

test("with first and more, returns hasNextPage true", async () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(51));
  const result = await applyPaginationToMongoCursor(mockCursor, { first: 50 }, 100);
  expect(result).toEqual({
    hasNextPage: true,
    hasPreviousPage: null
  });
  expect(mockCursor.limit.mock.calls).toEqual([[51], [50]]);
  expect(mockCursor.skip).not.toHaveBeenCalled();
});

test("with first and no more, returns hasNextPage false", async () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  const result = await applyPaginationToMongoCursor(mockCursor, { first: 50 }, 100);
  expect(result).toEqual({
    hasNextPage: false,
    hasPreviousPage: null
  });
  expect(mockCursor.limit.mock.calls).toEqual([[51], [50]]);
  expect(mockCursor.skip).not.toHaveBeenCalled();
});

test("with last and more, returns hasPreviousPage true", async () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(51));
  const result = await applyPaginationToMongoCursor(mockCursor, { last: 50 }, 80);
  expect(result).toEqual({
    hasNextPage: null,
    hasPreviousPage: true
  });
  expect(mockCursor.limit.mock.calls).toEqual([[51], [50]]);
  expect(mockCursor.skip.mock.calls).toEqual([[29], [30]]);
});

test("with last and no more, returns hasPreviousPage false", async () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  const result = await applyPaginationToMongoCursor(mockCursor, { last: 50 }, 80);
  expect(result).toEqual({
    hasNextPage: null,
    hasPreviousPage: false
  });
  expect(mockCursor.limit.mock.calls).toEqual([[51], [50]]);
  expect(mockCursor.skip.mock.calls).toEqual([[29], [30]]);
});
