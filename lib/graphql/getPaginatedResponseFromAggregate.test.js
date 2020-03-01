import getFakeMongoCollection from "../tests/getFakeMongoCollection.js";
import getPaginatedResponseFromAggregate from "./getPaginatedResponseFromAggregate.js";
import {
  restore as restore$applyPaginationToMongoAggregate,
  rewire as rewire$applyPaginationToMongoAggregate
} from "./applyPaginationToMongoAggregate.js";
import { restore as restore$getMongoSort, rewire as rewire$getMongoSort } from "./getMongoSort.js";

const baseQuery = { _id: "BASE_QUERY" };
const mockCollection = getFakeMongoCollection("COLLECTIONss", ["1", "2", "3", "4", "5"], { query: baseQuery });
const mockPipeline = [{ "$someOperator": "someParameter" }];
const applyPaginationToMongoAggregateMock = jest
  .fn()
  .mockName("applyPaginationToMongoAggregate")
  .mockReturnValue({ hasNextPage: true, hasPreviousPage: null });
const getMongoSortMock = jest.fn().mockName("getMongoSort");

const mockArgs = { sortOrder: "asc", sortBy: "name" };

beforeAll(() => {
  rewire$applyPaginationToMongoAggregate(applyPaginationToMongoAggregateMock);
  rewire$getMongoSort(getMongoSortMock);
});

afterAll(() => {
  restore$applyPaginationToMongoAggregate();
  restore$getMongoSort();
});

test("calls applyPaginationToMongoAggregate with mongo cursor and args", async () => {
  await getPaginatedResponseFromAggregate(mockCollection, mockPipeline, mockArgs);
  expect(applyPaginationToMongoAggregateMock).toHaveBeenCalledWith(mockCollection, mockArgs, {
    includeHasNextPage: true,
    includeHasPreviousPage: true
  });
});

test("calls getMongoSort with correct args", async () => {
  await getPaginatedResponseFromAggregate(mockCollection, mockArgs);
  expect(getMongoSortMock).toHaveBeenCalledWith({
    sortBy: mockArgs.sortBy,
    sortOrder: mockArgs.sortOrder
  });
});

test("applies filter and sort and returns correct result", async () => {
  const nodes = [{ _id: "123start" }, { _id: "123end" }];
  getMongoSortMock.mockReturnValueOnce("SORT");
  mockCollection.toArray.mockReturnValueOnce(nodes);
  const result = await getPaginatedResponseFromAggregate(mockCollection, mockArgs);
  expect(mockCollection.filter).toHaveBeenCalledWith("FILTER");
  expect(mockCollection.sort).toHaveBeenCalledWith("SORT");
  expect(result).toEqual({
    nodes,
    pageInfo: { endCursor: "123end", hasNextPage: true, hasPreviousPage: true, startCursor: "123start" },
    totalCount: 5
  });
});
