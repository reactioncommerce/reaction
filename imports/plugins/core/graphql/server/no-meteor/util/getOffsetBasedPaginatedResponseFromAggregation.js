
/**
 * @name getOffsetBasedPaginatedFromAggregation
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Given an object with a collection and aggregation pipeline array, run a Mongo aggregation applying
 *   limit, and skip based on GraphQL resolver arguments.
 * @param {Object} aggregationOptions an object containing a collection and aggregation pipeline array
 * @param {MongoCollection} aggregationOptions.collection Mongo collection
 * @param {Array} aggregationOptions.pipeline Array of aggregation pipeline stages
 * @param {Object} args Connection arguments from GraphQL query
 * @return {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
export default async function getOffsetBasedPaginatedResponseFromAggregation(aggregationOptions, args) {
  const { collection, pipeline } = aggregationOptions;
  const limit = args.limit || 20;
  const page = args.page || 0;
  const skip = page * limit;

  // Apply limit and skip
  const facet = {
    $facet: {
      nodes: [
        { $skip: skip },
        { $limit: limit }
      ],
      pageInfo: [
        { $count: "totalCount" }
      ]
    }
  };

  // Run the aggregation
  const aggregationResult = await collection.aggregate([...pipeline, facet]).toArray();

  const { nodes, pageInfo } = aggregationResult[0];
  const { totalCount } = pageInfo[0];
  const nodeCount = (Array.isArray(nodes) && nodes.length) || 0;

  return {
    nodes,
    pageInfo: {
      hasNextPage: (page + 1) * limit < totalCount,
      hasPreviousPage: page > 0 && nodeCount,
      startCursor: (nodes.length && nodes[0]._id) || null,
      endCursor: (nodes.length && nodes[nodes.length - 1]._id) || null
    },
    totalCount
  };
}
