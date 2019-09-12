const DEFAULT_LIMIT = 20;

/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyPaginationToMongoCursor
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB cursor as necessary, based on GraphQL
 *   `first` and `last` params
 * @param {Cursor} cursor MongoDB cursor
 * @param {Object} args An object with `first` or `last` but not both.
 * @param {Object} options Options
 * @param {Boolean} [options.includeHasPreviousPage] Whether to return the `pageInfo.hasPreviousPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @param {Boolean} [options.includeHasNextPage] Whether to return the `pageInfo.hasNextPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @returns {Promise<Object>} `{ hasNextPage, hasPreviousPage }`
 */
export default async function applyPaginationToMongoCursor(cursor, { first, last } = {}, {
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
    const totalCount = await cursor.clone().count();
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
        const prevCursor = cursor.clone();
        prevCursor.limit(limit + 1);
        prevCursor.skip(skip - 1);
        const prevCursorCount = await prevCursor.count();
        hasPreviousPage = prevCursorCount > limit;
      }
    }
  } else if (includeHasNextPage) {
    // For forward pagination, we can find out whether there is a next page here, but we can't
    // find out whether there's a previous page because the cursor has already had "after" filtering
    // added. Code external to this function will need to determine whether there are any documents
    // before that "after" ID.
    const nextCursor = cursor.clone();
    nextCursor.limit(limit + 1);
    const nextCursorCount = await nextCursor.count();
    hasNextPage = nextCursorCount > limit;
  }

  // Now apply actual limit + skip to the provided cursor
  cursor.limit(limit);
  if (skip) cursor.skip(skip);

  return {
    hasNextPage,
    hasPreviousPage
  };
}
