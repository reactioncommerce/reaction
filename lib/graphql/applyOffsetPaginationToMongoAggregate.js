/* eslint-disable quote-props */
const DEFAULT_LIMIT = 20;

/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyOffsetPaginationToMongoAggregate
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB aggregation pipeline as necessary, based on GraphQL
 *   `first` and `offset` params
 * @param {MongoDB.Collection} collection MongoDB collection to run the aggregation pipeline on
 * @param {Array} pipeline MongoDB aggregation pipeline
 * @param {Object} args An object with `offset` or `last` but not both.
 * @param {Object} options Options
 * @param {Boolean} [options.includeHasNextPage] Whether to return the `pageInfo.hasNextPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @return {Promise<Object>} `{ hasNextPage, hasPreviousPage, pipeline }`
 */
export default async function applyOffsetPaginationToMongoAggregate(collection, pipeline, { first, offset } = {}, {
  includeHasNextPage = true
} = {}) {
  // Enforce a `first: 20` limit if no user-supplied limit, using the DEFAULT_LIMIT
  const limit = first || DEFAULT_LIMIT;
  const newPipeline = [...pipeline];

  const hasPreviousPage = offset > 0;

  // Apply limit + skip to the provided pipeline
  if (hasPreviousPage) {
    newPipeline.push({
      "$skip": offset
    });
  }

  newPipeline.push({
    "$limit": limit
  });

  let hasNextPage = null;

  if (includeHasNextPage) {
    const nextCursor = collection.aggregate(pipeline);
    const nextDoc = await nextCursor.hasNext();
    hasNextPage = !!nextDoc;
  }

  return {
    hasNextPage,
    hasPreviousPage,
    pipeline: newPipeline
  };
}

