import applyPaginationToMongoAggregation from "./applyPaginationToMongoAggregation";

/**
 * Resolvers that return multiple documents in the form of a connection should construct a
 * MongoDB query, pass that cursor to this function, and then return the result.
 *
 * @name getPaginatedResponse
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Given a MongoDB cursor, adds skip, limit, sort, and other filters as necessary
 *   based on GraphQL resolver arguments.
 * @param {Object} aggregationParams An object containing the collection and aggregation pipeline
 * @param {MongoCollection} [aggregationParams.collection] - Mongo collection is run the aggregation on
 * @param {Array} [aggregationParams.pipeline] - Mongo aggregation pipeline array
 * @param {Object} args Connection arguments from GraphQL query
 * @param {String} [args.after] - ID  of the cursor result
 * @param {String} [args.before] - ID of the cursor result
 * @param {Integer} [args.first] - Number of results to return after the `after`
 * @param {Integer} [args.last] -  Number of results to return before the `before`
 * @return {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
export default async function getPaginatedAggregateResponse(aggregationParams, args) {
  const { totalCount, pageInfo: { hasNextPage, hasPreviousPage }, nodes } = await applyPaginationToMongoAggregation(aggregationParams, args);

  const pageInfo = {
    hasPreviousPage,
    hasNextPage
  };

  if (nodes && nodes.length) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[nodes.length - 1]._id;
  }

  return { nodes, pageInfo, totalCount };
}
