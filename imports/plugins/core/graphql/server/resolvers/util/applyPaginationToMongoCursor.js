/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyPaginationToMongoCursor
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB cursor as necessary, based on GraphQL
 *   `first` and `last` params
 * @param {Cursor} cursor MongoDB cursor
 * @param {Object} args GraphQL query arguments
 * @param {Number} totalCount Total count of docs that match the query, after applying the before/after filter
 * @return {Promise<Object>} `{ pageInfo }`
 */
export default async function applyPaginationToMongoCursor(cursor, { first, last } = {}, totalCount) {
  if (first && last) throw new Error("Request either `first` or `last` but not both");

  // Enforce a `first: 50` limit if no user-supplied limit
  const limit = first || last || 50;

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
      const prevCursor = cursor.clone();
      prevCursor.limit(limit + 1);
      prevCursor.skip(skip - 1);
      const prevCursorCount = await prevCursor.count();
      hasPreviousPage = prevCursorCount > limit;
    }
  } else {
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
