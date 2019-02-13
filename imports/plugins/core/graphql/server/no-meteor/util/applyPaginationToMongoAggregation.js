const DEFAULT_LIMIT = 20;

/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyPaginationToMongoAggregation
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB Aggregation as necessary, based on GraphQL
 *   `first` and `last` params
 * @param {Object} aggregationParams An object containing the collection and aggregation pipeline
 * @param {MongoCollection} [aggregationParams.collection] - Mongo collection is run the aggregation on
 * @param {Array} [aggregationParams.pipeline] - Mongo aggregation pipeline array
 * @param {Object} args GraphQL query arguments
 * @param {Number} totalCount Total count of docs that match the query, after applying the before/after filter
 * @return {Promise<Object>} `{ totalCount, pageInfo: { hasNextPage, hasPreviousPage }, nodes }`
 */
export default async function applyPaginationToMongoAggregation(aggregationParams, { first, last } = {}, totalCount) {
  const { collection, pipeline } = aggregationParams;

  if (first && last) throw new Error("Request either `first` or `last` but not both");

  // Enforce a `first: 20` limit if no user-supplied limit, using the DEFAULT_LIMIT
  const limit = first || last || DEFAULT_LIMIT;

  let skip = 0;
  if (last && totalCount > last) skip = totalCount - last;

  let hasNextPage = null;
  let hasPreviousPage = null;
  if (last) {
    if (skip === 0) {
      hasPreviousPage = false;
    } else {
      // For backward pagination, we can find out whether there is a previous page here, but we can't
      // find out whether there's a next page because the cursor has already had "before" filtering
      // added. Code external to this function will need to determine whether there are any documents
      // after that "before" ID.

      const facet = {
        $facet: {
          nodes: [
            { $limit: limit + 1 },
            { $skip: skip - 1 }
          ]
        }
      };

      const result = await collection.aggregate([...pipeline, facet]).toArray();
      const { nodes } = (result && result[0]) || { nodes: [] };
      hasPreviousPage = nodes.length > limit;
    }
  } else {
    // For forward pagination, we can find out whether there is a next page here, but we can't
    // find out whether there's a previous page because the cursor has already had "after" filtering
    // added. Code external to this function will need to determine whether there are any documents
    // before that "after" ID.
    const facet = {
      $facet: {
        nodes: [
          { $limit: limit + 1 }
        ]
      }
    };

    const result = await collection.aggregate([...pipeline, facet]).toArray();
    const { nodes } = (result && result[0]) || { nodes: [] };
    hasNextPage = nodes.length > limit;
  }

  // Now apply actual limit + skip
  const facet = {
    $facet: {
      nodes: [
        { $limit: limit },
        { $skip: skip || 0 }
      ],
      pageInfo: [
        { $count: "totalCount" }
      ]
    }
  };

  const results = await collection.aggregate([...pipeline, facet]).toArray();

  if (results[0]) {
    var firstResult = results[0]
    var nodes = firstResult.nodes;
    var totalCount = firstResult.pageInfo[0].totalCount;
  }
  
  return {
    totalCount,
    pageInfo: { hasNextPage, hasPreviousPage },
    nodes
  };
}
