import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import applyOffsetPaginationToMongoCursor from "./applyOffsetPaginationToMongoCursor";

let mockCursor;
beforeEach(() => {
  mockCursor = getFakeMongoCursor("Test", new Array(100));
});

test("without first limits to first 20", async () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(30));
  mockCursor.hasNext.mockReturnValueOnce(true);
  const result = await applyOffsetPaginationToMongoCursor(mockCursor, { offset: 1 });

  expect(result).toEqual({
    hasNextPage: true,
    hasPreviousPage: true
  });

  expect(mockCursor.limit.mock.calls).toEqual([[20], [1], [20]]);
  expect(mockCursor.skip).toHaveBeenCalled();
});

test("returns hasNextPage correctly when no more items exist", async () => {
  mockCursor.count
    .mockReturnValueOnce(Promise.resolve(0));

  mockCursor.hasNext.mockReturnValueOnce(false);
  const result = await applyOffsetPaginationToMongoCursor(mockCursor, { offset: 1, first: 10 });

  expect(result).toEqual({
    hasNextPage: false,
    hasPreviousPage: true
  });
});
