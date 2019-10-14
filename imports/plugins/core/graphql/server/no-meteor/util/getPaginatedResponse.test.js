import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import getPaginatedResponse from "./getPaginatedResponse";
import {
  restore as restore$applyBeforeAfterToFilter,
  rewire as rewire$applyBeforeAfterToFilter
} from "./applyBeforeAfterToFilter";
import {
  restore as restore$applyPaginationToMongoCursor,
  rewire as rewire$applyPaginationToMongoCursor
} from "./applyPaginationToMongoCursor";
import { restore as restore$getMongoSort, rewire as rewire$getMongoSort } from "./getMongoSort";

const baseQuery = { _id: "BASE_QUERY" };
const mockCursor = getFakeMongoCursor("COLLECTIONss", ["1", "2", "3", "4", "5"], { query: baseQuery });
mockCursor.options.db.collection = jest
  .fn()
  .mockName("db.collection")
  .mockReturnValue({
    findOne: ({ _id }) => Promise.resolve({ _id })
  });

const applyBeforeAfterToFilterMock = jest.fn().mockName("applyBeforeAfterToFilter");
const applyPaginationToMongoCursorMock = jest
  .fn()
  .mockName("applyPaginationToMongoCursor")
  .mockReturnValue({ hasNextPage: true, hasPreviousPage: null });
const getMongoSortMock = jest.fn().mockName("getMongoSort");

const mockArgs = { before: "123", sortOrder: "asc", sortBy: "name" };

beforeAll(() => {
  rewire$applyBeforeAfterToFilter(applyBeforeAfterToFilterMock);
  rewire$applyPaginationToMongoCursor(applyPaginationToMongoCursorMock);
  rewire$getMongoSort(getMongoSortMock);
});

afterAll(() => {
  restore$applyBeforeAfterToFilter();
  restore$applyPaginationToMongoCursor();
  restore$getMongoSort();
});

test("calls applyPaginationToMongoCursor with mongo cursor and args", async () => {
  await getPaginatedResponse(mockCursor, mockArgs);
  expect(applyPaginationToMongoCursorMock).toHaveBeenCalledWith(mockCursor, mockArgs, {
    includeHasNextPage: true,
    includeHasPreviousPage: true
  });
});

test("calls applyBeforeAfterToFilter with correct args", async () => {
  await getPaginatedResponse(mockCursor, mockArgs);
  expect(applyBeforeAfterToFilterMock).toHaveBeenCalledWith({
    ...mockArgs,
    after: undefined,
    before: { _id: "123" },
    baseFilter: baseQuery
  });
});

test("calls getMongoSort with correct args", async () => {
  await getPaginatedResponse(mockCursor, mockArgs);
  expect(getMongoSortMock).toHaveBeenCalledWith({
    sortBy: mockArgs.sortBy,
    sortOrder: mockArgs.sortOrder
  });
});

test("applies filter and sort and returns correct result", async () => {
  const nodes = [{ _id: "123start" }, { _id: "123end" }];
  getMongoSortMock.mockReturnValueOnce("SORT");
  applyBeforeAfterToFilterMock.mockReturnValueOnce("FILTER");
  mockCursor.toArray.mockReturnValueOnce(nodes);
  const result = await getPaginatedResponse(mockCursor, mockArgs);
  expect(mockCursor.filter).toHaveBeenCalledWith("FILTER");
  expect(mockCursor.sort).toHaveBeenCalledWith("SORT");
  expect(result).toEqual({
    nodes,
    pageInfo: { endCursor: "123end", hasNextPage: true, hasPreviousPage: true, startCursor: "123start" },
    totalCount: 5
  });
});
