import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter.js";
import applyOffsetPaginationToMongoCursor from "./applyOffsetPaginationToMongoCursor.js";
import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor.js";
import getCollectionFromCursor from "./getCollectionFromCursor.js";
import getMongoSort from "./getMongoSort.js";

/**
 * Resolvers that return multiple documents in the form of a connection should construct a
 * MongoDB query, pass that cursor to this function, and then return the result.
 *
 * @name getPaginatedResponse
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Given a MongoDB cursor, adds skip, limit, sort, and other filters as necessary
 *   based on GraphQL resolver arguments.
 * @param {Cursor} mongoCursor Node MongoDB Cursor instance. Will be mutated.
 * @param {Object} args Connection arguments from GraphQL query
 * @param {Object} options Options
 * @param {Boolean} [options.includeTotalCount] Whether to return the `totalCount`. Default is `true`. Set this to
 *   `false` if you don't need it to avoid an extra database command.
 * @param {Boolean} [options.includeHasPreviousPage] Whether to return the `pageInfo.hasPreviousPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @param {Boolean} [options.includeHasNextPage] Whether to return the `pageInfo.hasNextPage`.
 *   Default is `true`. Set this to `false` if you don't need it to avoid an extra database command.
 * @returns {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
async function getPaginatedResponse(mongoCursor, args, {
  includeHasNextPage = true,
  includeHasPreviousPage = true,
  includeTotalCount = true
} = {}) {
  const { offset, last, sortBy, sortOrder } = args;
  const baseFilter = mongoCursor.cmd.query;

  // Get the total count, prior to adding before/after filtering
  let totalCount = null;
  if (includeTotalCount) {
    totalCount = await mongoCursor.clone().count();
  }

  // Get a MongoDB sort object
  const sort = getMongoSort({ sortBy, sortOrder });

  // Find the document for the before/after ID
  const collection = getCollectionFromCursor(mongoCursor);
  let { after, before } = args;
  let hasMore = false;
  if (after || before) {
    const doc = await collection.findOne({
      _id: before || after
    }, {
      fields: {
        [sortBy]: 1
      }
    });

    if (after) after = doc;
    if (before) before = doc;
    hasMore = true;
  }

  // Get an updated filter, with before/after added
  const updatedFilter = applyBeforeAfterToFilter({
    baseFilter,
    after,
    before,
    sortBy,
    sortOrder
  });

  // Apply these to the cursor
  mongoCursor.filter(updatedFilter).sort(sort);

  let hasPreviousPage;
  let hasNextPage;

  if (offset !== undefined) {
    // offset and last cannot be used together
    if (last) throw new Error("Request either `last` or `offset` but not both");

    ({ hasPreviousPage, hasNextPage } = await applyOffsetPaginationToMongoCursor(mongoCursor, args, {
      includeHasNextPage
    }));
  } else {
    // Skip calculating pageInfo if it wasn't requested. Saves a db count command.
    ({ hasPreviousPage, hasNextPage } = await applyPaginationToMongoCursor(mongoCursor, args, {
      includeHasNextPage,
      includeHasPreviousPage
    }));
  }

  // Figure out proper hasNext/hasPrevious
  const pageInfo = {};
  if (includeHasNextPage) {
    pageInfo.hasNextPage = hasNextPage === null ? hasMore : hasNextPage;
  }
  if (includeHasPreviousPage) {
    pageInfo.hasPreviousPage = hasPreviousPage === null ? hasMore : hasPreviousPage;
  }

  const nodes = await mongoCursor.toArray();
  const count = nodes.length;
  if (count) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[count - 1]._id;
  }

  return { nodes, pageInfo, totalCount };
}

export default getPaginatedResponse;
