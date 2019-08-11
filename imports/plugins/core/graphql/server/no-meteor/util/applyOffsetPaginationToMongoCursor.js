const DEFAULT_LIMIT = 20;

/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyOffsetPaginationToMongoCursor
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB cursor as necessary, based on GraphQL
 *   `first` and `offset` params
 * @param {Cursor} cursor MongoDB cursor
 * @param {Object} args An object with `offset` or `last` but not both.
 * @param {Object} options Options
 * @param {Boolean} [options.includeHasNextPage] Whether to return the `pageInfo.hasNextPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @return {Promise<Object>} `{ hasNextPage, hasPreviousPage }`
 */
export default async function applyOffsetPaginationToMongoCursor(cursor, { first, offset } = {}, {
  includeHasNextPage = true
} = {}) {
  // Enforce a `first: 20` limit if no user-supplied limit, using the DEFAULT_LIMIT
  const limit = first || DEFAULT_LIMIT;

  // Rewind the cursor to start at a zero index
  cursor.rewind();

  // Now apply actual limit + skip to the provided cursor
  cursor.limit(limit);
  cursor.skip(offset);

  let hasNextPage = null;

  const hasPreviousPage = offset > 0;

  if (includeHasNextPage) {
    const nextCursor = cursor.clone();

    nextCursor.skip(offset + limit);
    nextCursor.limit(1);

    const nextDoc = await nextCursor.hasNext();
    hasNextPage = !!nextDoc;

    cursor.limit(limit);
    cursor.skip(offset);
  }

  return {
    hasNextPage,
    hasPreviousPage
  };
}
