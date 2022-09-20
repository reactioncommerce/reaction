/**
 * Helper functions for use in Jest tests
 * @namespace TestHelpers
 */

/**
 * @name getFakeMongoCollection
 * @method
 * @memberof TestHelpers
 * @param {String} collectionName - name of the collection
 * @param {Any} aggregateResults - aggregateResults to be returned as part of the collection
 * @param {Object} options - options to pass to the query
 * @returns {Object} fake collection
 */
export default function getFakeMongoCollection(collectionName, aggregateResults) {
  const collection = {};

  collection.aggregate = jest.fn().mockName("collection.aggregate").mockImplementation(() => collection.aggregate);
  collection.aggregate.count = jest.fn().mockName("collection.aggregate.count").mockReturnValue(aggregateResults.length);
  collection.aggregate.hasNext = jest.fn().mockName("collection.aggregate.hasNext").mockResolvedValue(false);
  collection.aggregate.apply = jest.fn().mockName("collection.aggregate.apply").mockReturnValue(collection);
  collection.aggregate.toArray = jest.fn().mockName("collection.aggregate.toArray").mockReturnValue(aggregateResults);

  return collection;
}
