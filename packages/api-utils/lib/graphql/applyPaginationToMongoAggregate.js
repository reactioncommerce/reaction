/* eslint-disable quote-props */
const DEFAULT_LIMIT = 20;

/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyPaginationToMongoAggregate
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB aggregation pipeline as necessary, based on GraphQL
 *   `first` and `last` params
 * @param {MongoDB.Collection} collection MongoDB collection to run the aggregation pipeline on
 * @param {Array} pipeline MongoDB aggregation pipeline
 * @param {Object} args An object with `first` or `last` but not both.
 * @param {Object} options Options
 * @param {Boolean} [options.includeHasPreviousPage] Whether to return the `pageInfo.hasPreviousPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @param {Boolean} [options.includeHasNextPage] Whether to return the `pageInfo.hasNextPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @returns {Promise<Object>} `{ hasNextPage, hasPreviousPage, pipeline }`
 */
export default async function applyPaginationToMongoAggregate(collection, pipeline, { first, last } = {}, {
  includeHasNextPage = true,
  includeHasPreviousPage = true
} = {}) {
  if (first && last) throw new Error("Request either `first` or `last` but not both");

  // Enforce a `first: 20` limit if no user-supplied limit, using the DEFAULT_LIMIT
  const limit = first || last || DEFAULT_LIMIT;

  let skip = 0;

  let hasNextPage = null;
  let hasPreviousPage = null;

  if (last) {
    // Get the new count after applying before/after
    const totalCount = await collection.aggregate(pipeline).count();
    if (totalCount > last) {
      skip = totalCount - last;
    }

    if (includeHasPreviousPage) {
      if (skip === 0) {
        hasPreviousPage = false;
      } else {
        // For backward pagination, we can find out whether there is a previous page here, but we can't
        // find out whether there's a next page because the cursor has already had "before" filtering
        // added. Code external to this function will need to determine whether there are any documents
        // after that "before" ID.
        const prevPipeline = [...pipeline];
        prevPipeline.push({
          "$limit": limit + 1
        });
        prevPipeline.push({
          "$skip": skip - 1
        });
        const prevCursorCount = await collection.aggregate(prevPipeline).count();
        hasPreviousPage = prevCursorCount > limit;
      }
    }
  } else if (includeHasNextPage) {
    // For forward pagination, we can find out whether there is a next page here, but we can't
    // find out whether there's a previous page because the cursor has already had "after" filtering
    // added. Code external to this function will need to determine whether there are any documents
    // before that "after" ID.
    const nextPipeline = [...pipeline];
    nextPipeline.push({
      "$limit": limit + 1
    });
    const nextCursorCount = await collection.aggregate(nextPipeline).count();
    hasNextPage = nextCursorCount > limit;
  }

  // Apply limit + skip to the provided pipeline
  pipeline.push({
    "$limit": limit
  });

  if (skip > 0) {
    pipeline.push({
      "$skip": skip
    });
  }

  return {
    hasNextPage,
    hasPreviousPage,
    pipeline
  };
}

