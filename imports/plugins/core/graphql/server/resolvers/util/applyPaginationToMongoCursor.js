/**
 * Mostly borrowed from https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 */
export default async function applyPaginationToMongoCursor(cursor, { first, last } = {}) {
  const totalCount = await cursor.clone().count();
  let resultCount = totalCount;

  if (first || last) {
    let limit;
    let skip;

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

    resultCount = await cursor.clone().count();
  }

  return {
    totalCount,
    pageInfo: {
      hasNextPage: first ? resultCount >= first : null,
      hasPreviousPage: last ? resultCount >= last : null
    }
  };
}
