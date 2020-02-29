import getFakeMongoCollection from "../tests/getFakeMongoCollection.js";
import applyOffsetPaginationToMongoAggregate from "./applyOffsetPaginationToMongoAggregate.js";

let mockCollection, mockPipeline;
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
        "$limit": 20
      },
      {
        "$skip": 1
      }
    ])
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
        "$limit": 10
      },
      {
        "$skip": 1
      } 
    ])
  });
});
