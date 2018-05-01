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
export default async function applyPaginationToMongoCursor(cursor, { first: requestedFirst, last } = {}, totalCount) {
  let limit;
  let skip;

  let first;
  if (!requestedFirst && !last) {
    first = 50;
  } else {
    first = requestedFirst;
  }

  if (first && totalCount > first) {
    limit = first;
  }

  if (last) {
    if (limit && limit > last) {
      skip = limit - last;
      limit -= skip;
    } else if (!limit && totalCount > last) {
      skip = totalCount - last;
    }
  }

  if (skip) {
    cursor.skip(skip);
  }

  if (limit) {
    cursor.limit(limit);
  }

  const resultCount = await cursor.clone().count();

  return {
    pageInfo: {
      hasNextPage: !!first && resultCount >= first,
      hasPreviousPage: !!last && resultCount >= last
    }
  };
}
