import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const mockCursor = getFakeMongoCursor("Test", new Array(100));

test("with neither first nor last limits to 50", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, undefined, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    }
  });
});

test("with first and maybe more, returns hasNextPage true", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { first: 50 }, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    }
  });
});

test("with first and definitely more, returns hasNextPage true", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { first: 50 }, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    }
  });
});

test("with first and no more, returns hasNextPage false", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(40));
  expect(applyPaginationToMongoCursor(mockCursor, { first: 50 }, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    }
  });
});

test("with last and maybe more, returns hasPreviousPage true", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { last: 50 }, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: true
    }
  });
});

test("with last and definitely more, returns hasPreviousPage true", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { last: 50 }, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: true
    }
  });
});

test("with last and no more, returns hasPreviousPage false", () => {
  mockCursor.count.mockReturnValueOnce(Promise.resolve(40));
  expect(applyPaginationToMongoCursor(mockCursor, { last: 50 }, 100)).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    }
  });
});
