/* eslint-disable quote-props */
import getFakeMongoCollection from "../tests/getFakeMongoCollection.js";
import applyPaginationToMongoAggregate from "./applyPaginationToMongoAggregate.js";

let mockCollection;
let mockPipeline;
beforeEach(() => {
  mockCollection = getFakeMongoCollection("Test", new Array(100));
  mockPipeline = [{ "$someOperator": "someParameter" }];
});

test("with neither first nor last limits to first 20", async () => {
  mockCollection.aggregate.count.mockReturnValueOnce(Promise.resolve(21));
  const result = await applyPaginationToMongoAggregate(mockCollection, mockPipeline, undefined);
  expect(result).toEqual({
    hasNextPage: true,
    hasPreviousPage: null,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$limit": 20
      }
    ])
  });
});

test("with both first and last, throws error", () => {
  expect(applyPaginationToMongoAggregate(mockCollection, mockPipeline, { first: 1, last: 1 })).rejects.toThrowErrorMatchingSnapshot();
});

test("with first and more, returns hasNextPage true", async () => {
  mockCollection.aggregate.count.mockReturnValueOnce(Promise.resolve(51));
  const result = await applyPaginationToMongoAggregate(mockCollection, mockPipeline, { first: 50 });
  expect(result).toEqual({
    hasNextPage: true,
    hasPreviousPage: null,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$limit": 50
      }
    ])
  });
});

test("with first and no more, returns hasNextPage false", async () => {
  mockCollection.aggregate.count.mockReturnValueOnce(Promise.resolve(50));
  const result = await applyPaginationToMongoAggregate(mockCollection, mockPipeline, { first: 50 });
  expect(result).toEqual({
    hasNextPage: false,
    hasPreviousPage: null,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$limit": 50
      }
    ])
  });
});

test("with last and more, returns hasPreviousPage true", async () => {
  mockCollection.aggregate.count
    .mockReturnValueOnce(Promise.resolve(80))
    .mockReturnValueOnce(Promise.resolve(51));
  const result = await applyPaginationToMongoAggregate(mockCollection, mockPipeline, { last: 50 });
  expect(result).toEqual({
    hasNextPage: null,
    hasPreviousPage: true,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$limit": 50
      },
      {
        "$skip": 30
      }
    ])
  });
});

test("with last and no more, returns hasPreviousPage false", async () => {
  mockCollection.aggregate.count
    .mockReturnValueOnce(Promise.resolve(80))
    .mockReturnValueOnce(Promise.resolve(50));
  const result = await applyPaginationToMongoAggregate(mockCollection, mockPipeline, { last: 50 });
  expect(result).toEqual({
    hasNextPage: null,
    hasPreviousPage: false,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$limit": 50
      },
      {
        "$skip": 30
      }
    ])
  });
});
