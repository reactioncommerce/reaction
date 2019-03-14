const DEFAULT_LIMIT = 20;

/**
 * @name applyPaginationToMongoAggregation
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Returns results of Mongo Aggregation, with first and after or last and before args applied as specificed in the Relay Cursor Connections Specification's pagination algorithm https://facebook.github.io/relay/graphql/connections.htm#sec-Pagination-algorithm
 * @param {Object} aggregationParams An object containing the collection and aggregation pipeline
 * @param {MongoCollection} [aggregationParams.collection] - Mongo collection is run the aggregation on
 * @param {Array} [aggregationParams.pipeline] - Mongo aggregation pipeline array
 * @param {Object} args - Connection arguments from GraphQL query
 * @param {String} [args.after] - ID  of the cursor result
 * @param {String} [args.before] - ID of the cursor result
 * @param {Integer} [args.first] - Number of results to return after the `after`
 * @param {Integer} [args.last] -  Number of results to return before the `before`
 * @return {Promise<Object>} `{ totalCount, pageInfo: { hasNextPage, hasPreviousPage }, nodes }`
 */
export default async function applyPaginationToMongoAggregation(aggregationParams, { first, last, before, after } = {}) {
  const { collection, pipeline } = aggregationParams;

  if (first && last) throw new Error("Request either `first` or `last` but not both");

  // Facet: Add pageInfo and count
  const facet = {
    $facet: {
      nodes: [
        { $skip: 0 }
      ],
      pageInfo: [
        { $count: "totalCount" }
      ]
    }
  };

  const unpaginatedResults = await collection.aggregate([...pipeline, facet]).toArray();
  let hasPreviousPage;
  let hasNextPage;
  let paginatedItems;
  let totalCount;
  const limit = first || last || DEFAULT_LIMIT;

  if (unpaginatedResults[0].nodes.length === 0) {
    totalCount = unpaginatedResults[0].nodes.length;
    hasNextPage = false;
    hasPreviousPage = false;
    paginatedItems = unpaginatedResults[0].nodes;
  } else {
    const unpaginatedItems = unpaginatedResults[0].nodes;
    // eslint-disable-next-line prefer-destructuring
    totalCount = unpaginatedResults[0].pageInfo[0].totalCount;
    if (after) {
      // first and after
      const indexOfCursor = unpaginatedItems.findIndex((item) => item._id === after);
      hasPreviousPage = indexOfCursor > 0;
      hasNextPage = ((totalCount - (limit + indexOfCursor - 1)) > 0);
      paginatedItems = unpaginatedItems.slice(indexOfCursor + 1, indexOfCursor + 1 + limit);
    } else if (before) {
      // before and last
      const indexOfCursor = unpaginatedItems.findIndex((item) => item._id === before);
      hasPreviousPage = totalCount > (indexOfCursor + limit);
      hasNextPage = totalCount > indexOfCursor;
      const startIndex = ((indexOfCursor - 1 - limit) > 0) ? (indexOfCursor - 1 - limit) : 0;
      paginatedItems = unpaginatedItems.slice(startIndex, indexOfCursor);
    } else if (last) {
      hasPreviousPage = (totalCount - limit) > 0;
      hasNextPage = false;
      const startIndex = unpaginatedItems.length - limit;
      const endIndex = unpaginatedItems.length;
      paginatedItems = unpaginatedItems.slice(startIndex, endIndex);
    } else {
      // If after, before, and last are not provided, assume first
      const startIndex = 0;
      hasPreviousPage = false;
      hasNextPage = (totalCount - limit) > 0;
      paginatedItems = unpaginatedItems.slice(startIndex, startIndex + limit);
    }
  }

  return {
    totalCount,
    pageInfo: { hasNextPage, hasPreviousPage },
    nodes: paginatedItems
  };
}
