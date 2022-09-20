/* eslint-disable quote-props */
import getFakeMongoCollection from "../tests/getFakeMongoCollection.js";
import applyOffsetPaginationToMongoAggregate from "./applyOffsetPaginationToMongoAggregate.js";

let mockCollection;
let mockPipeline;
beforeEach(() => {
  mockCollection = getFakeMongoCollection("Test", new Array(100), {});
  mockPipeline = [{ "$someOperator": "someParameter" }]; // TODO: Implement real MongoDB test library to use actual pipelines
});

test("without first limits to first 20", async () => {
  mockCollection.aggregate.count.mockReturnValueOnce(Promise.resolve(30));
  mockCollection.aggregate.hasNext.mockReturnValueOnce(true);

  const result = await applyOffsetPaginationToMongoAggregate(mockCollection, mockPipeline, { offset: 1 });

  expect(result).toEqual({
    hasNextPage: true,
    hasPreviousPage: true,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$skip": 1
      },
      {
        "$limit": 20
      }
    ])
  });

  // Ensure skip comes before limit, otherwise pagination does not work
  expect(result.pipeline[1]).toEqual({
    "$skip": 1
  });

  expect(result.pipeline[2]).toEqual({
    "$limit": 20
  });
});

test("returns hasNextPage correctly when no more items exist", async () => {
  mockCollection.aggregate.count.mockReturnValueOnce(Promise.resolve(0));
  mockCollection.aggregate.hasNext.mockReturnValueOnce(false);
  const result = await applyOffsetPaginationToMongoAggregate(mockCollection, mockPipeline, { offset: 1, first: 10 });

  expect(result).toEqual({
    hasNextPage: false,
    hasPreviousPage: true,
    pipeline: expect.arrayContaining([
      {
        "$someOperator": "someParameter"
      },
      {
        "$skip": 1
      },
      {
        "$limit": 10
      }
    ])
  });

  // Ensure skip comes before limit, otherwise pagination does not work
  expect(result.pipeline[1]).toEqual({
    "$skip": 1
  });

  expect(result.pipeline[2]).toEqual({
    "$limit": 10
  });
});
