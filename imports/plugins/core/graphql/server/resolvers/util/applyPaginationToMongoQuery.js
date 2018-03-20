/**
 * Mostly borrowed from https://www.reindex.io/blog/relay-graphql-pagination-with-mongodb/
 */
export default async function applyPaginationToMongoQuery(query, { first, last }) {
  const totalCount = await query.clone().count();

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
      query.skip(skip);
    }

    if (limit) {
      query.limit(limit);
    }
  }

  return {
    totalCount,
    pageInfo: {
      hasNextPage: !!first && totalCount > first,
      hasPreviousPage: !!last && totalCount > last
    }
  };
}
