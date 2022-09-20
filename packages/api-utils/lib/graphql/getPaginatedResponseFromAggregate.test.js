/* eslint-disable quote-props */
import { jest } from "@jest/globals";
import getFakeMongoCollection from "../tests/getFakeMongoCollection.js";
import getPaginatedResponseFromAggregate from "./getPaginatedResponseFromAggregate.js";
import { restore as restore$getMongoSort, rewire as rewire$getMongoSort } from "./getMongoSort.js";

const mockCollection = getFakeMongoCollection("SomeCollection", ["1", "2", "3", "4", "5"]);
const getMongoSortMock = jest.fn().mockName("getMongoSort");

const mockArgs = { sortOrder: "asc", sortBy: "name" };

let mockPipeline;

beforeAll(() => {
  rewire$getMongoSort(getMongoSortMock);
});

beforeEach(() => {
  mockPipeline = [{ "$someOperator": "someParameter" }];
});

afterAll(() => {
  restore$getMongoSort();
});

test("throws error when using `after` connection arg", async () => {
  await expect(getPaginatedResponseFromAggregate(mockCollection, mockPipeline, {
    ...mockArgs,
    after: "someCursor"
  })).rejects.toThrow(Error);
});

test("throws error when using `before` connection arg", async () => {
  await expect(getPaginatedResponseFromAggregate(mockCollection, mockPipeline, {
    ...mockArgs,
    before: "someCursor"
  })).rejects.toThrow(Error);
});

test("calls getMongoSort with correct args", async () => {
  await getPaginatedResponseFromAggregate(mockCollection, mockPipeline, mockArgs);
  expect(getMongoSortMock).toHaveBeenCalledWith({
    sortBy: mockArgs.sortBy,
    sortOrder: mockArgs.sortOrder
  });
});

test("includes sort param in pipeline and returns correct result", async () => {
  const nodes = [{ _id: "123start" }, { _id: "123end" }];
  getMongoSortMock.mockReturnValueOnce("SORT");
  mockCollection.aggregate.toArray.mockReturnValueOnce(nodes);
  const result = await getPaginatedResponseFromAggregate(mockCollection, mockPipeline, mockArgs);
  expect(result).toEqual({
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$group": {
          _id: null,
          objects: {
            "$addToSet": "$$ROOT"
          },
          totalCount: {
            "$sum": 1
          }
        }
      },
      {
        $unwind: {
          path: "$objects"
        }
      },
      {
        $set: {
          "$objects.totalCount": "$totalCount"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$objects"
        }
      },
      {
        "$sort": "SORT"
      },
      {
        "$limit": 20
      }
    ]),
    nodes,
    pageInfo: { endCursor: "123end", hasNextPage: false, hasPreviousPage: null, startCursor: "123start" }
  });
});

test("returns totalCount == 0 when there are no documents", async () => {
  const nodes = [];
  mockCollection.aggregate.toArray.mockReturnValueOnce(nodes);
  const result = await getPaginatedResponseFromAggregate(mockCollection, mockPipeline, mockArgs);
  expect(result).toEqual({
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$group": {
          _id: null,
          objects: {
            "$addToSet": "$$ROOT"
          },
          totalCount: {
            "$sum": 1
          }
        }
      },
      {
        $unwind: {
          path: "$objects"
        }
      },
      {
        $set: {
          "$objects.totalCount": "$totalCount"
        }
      },
      {
        $replaceRoot: {
          newRoot: "$objects"
        }
      },
      {
        "$limit": 20
      }
    ]),
    nodes,
    pageInfo: { hasNextPage: false, hasPreviousPage: null },
    totalCount: 0
  });
});
