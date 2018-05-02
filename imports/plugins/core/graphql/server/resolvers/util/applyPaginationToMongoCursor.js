/**
 * Inspired by https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 * @name applyPaginationToMongoCursor
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adds `skip` and `limit` to a MongoDB cursor as necessary, based on GraphQL
 *   `first` and `last` params
 * @return {Promise<Object>} `{ pageInfo }`
 */
export default async function applyPaginationToMongoCursor(cursor, { first, last } = {}, totalCount) {
  let resultCount = totalCount;
  let limit;
  let skip;

  let maybeFirst;
  if (!first && !last) {
    maybeFirst = 50;
  } else {
    maybeFirst = first;
  }

  if (maybeFirst && totalCount > maybeFirst) {
    limit = maybeFirst;
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

  resultCount = await cursor.clone().count();

  return {
    pageInfo: {
      hasNextPage: !!maybeFirst && resultCount >= maybeFirst,
      hasPreviousPage: !!last && resultCount >= last
    }
  };
}
