import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter";
import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor";
import getCollectionFromCursor from "./getCollectionFromCursor";
import getMongoSort from "./getMongoSort";

/**
 * Resolvers that return multiple documents in the form of a connection should construct a
 * MongoDB query, pass that cursor to this function, and then return the result.
 *
 * @name getPaginatedResponse
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Given a MongoDB cursor, adds skip, limit, sort, and other filters as necessary
 *   based on GraphQL resolver arguments.
 * @return {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
async function getPaginatedResponse(query, args) {
  const totalCount = await query.clone().count();
  const collection = getCollectionFromCursor(query);

  const baseFilter = query.cmd.query;
  const updatedFilter = await applyBeforeAfterToFilter({ collection, baseFilter, ...args });
  const sort = getMongoSort(args);

  query.filter(updatedFilter).sort(sort);

  const { pageInfo } = await applyPaginationToMongoCursor(query, args, totalCount);
  const nodes = await query.toArray();
  const count = nodes.length;

  if (count) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[count - 1]._id;
  }

  return { nodes, pageInfo, totalCount };
}

export default getPaginatedResponse;
