const DEFAULT_LIMIT = 20;

/**
 * @name getOffsetBasedPaginatedResponse
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Given a MongoDB cursor, adds skip, limit, sort, and other filters as necessary
 *   based on GraphQL resolver arguments.
 * @param {Cursor} mongoCursor Node MongoDB Cursor instance. Will be mutated.
 * @param {Object} args Connection arguments from GraphQL query
 * @return {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
export default async function getOffsetBasedPaginatedResponse(mongoCursor, args) {
  const { sortOrder } = args;
  const limit = args.limit || DEFAULT_LIMIT;
  const page = Math.max(args.page, 0);
  const skip = page * limit;
  let sortBy;

  if (sortBy === "minPrice") {
    if (typeof args.sortByPriceCurrencyCode !== "string") {
      throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
    }
    sortBy = `product.pricing.${args.sortByPriceCurrencyCode}.minPrice`;
  } else {
    sortBy = args.sortBy; // eslint-disable-line prefer-destructuring
  }

  // Count before applying filters
  const totalCount = await mongoCursor.clone().count();

  // Apply sorting and pagination
  mongoCursor
    .limit(limit)
    .skip(skip)
    .sort({
      [sortBy]: sortOrder === "desc" ? -1 : 1
    });

  // Get the desired results
  const nodes = await mongoCursor.toArray();
  const totalPageCount = Math.ceil(totalCount / limit);

  return {
    nodes,
    pageInfo: {
      hasNextPage: page >= 0 && (page + 1) < totalPageCount,
      hasPreviousPage: page > 0 && page < totalPageCount,
      startCursor: (nodes.length && nodes[0]._id) || null,
      endCursor: (nodes.length && nodes[nodes.length - 1]._id) || null
    },
    totalCount
  };
}
