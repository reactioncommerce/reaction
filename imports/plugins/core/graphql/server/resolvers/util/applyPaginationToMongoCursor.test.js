import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor";

const mockCount = jest.fn().mockName("cursor.clone.count");
const mockCursor = {
  clone: () => ({ count: mockCount }),
  limit: jest.fn().mockName("cursor.limit"),
  skip: jest.fn().mockName("cursor.skip")
};

test("with neither first nor last", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  expect(applyPaginationToMongoCursor(mockCursor)).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    totalCount: 100
  });
});

test("with first and maybe more, returns hasNextPage true", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  mockCount.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { first: 50 })).resolves.toEqual({
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    },
    totalCount: 100
  });
});

test("with first and definitely more, returns hasNextPage true", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  mockCount.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { first: 50 })).resolves.toEqual({
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    },
    totalCount: 100
  });
});

test("with first and no more, returns hasNextPage false", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  mockCount.mockReturnValueOnce(Promise.resolve(40));
  expect(applyPaginationToMongoCursor(mockCursor, { first: 50 })).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    totalCount: 100
  });
});

test("with last and maybe more, returns hasPreviousPage true", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  mockCount.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { last: 50 })).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: true
    },
    totalCount: 100
  });
});

test("with last and definitely more, returns hasPreviousPage true", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  mockCount.mockReturnValueOnce(Promise.resolve(50));
  expect(applyPaginationToMongoCursor(mockCursor, { last: 50 })).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: true
    },
    totalCount: 100
  });
});

test("with last and no more, returns hasPreviousPage false", () => {
  mockCount.mockReturnValueOnce(Promise.resolve(100));
  mockCount.mockReturnValueOnce(Promise.resolve(40));
  expect(applyPaginationToMongoCursor(mockCursor, { last: 50 })).resolves.toEqual({
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    totalCount: 100
  });
});
