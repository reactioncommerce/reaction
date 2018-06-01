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
 * @param {Cursor} mongoCursor Node MongoDB Cursor instance. Will be mutated.
 * @param {Object} args Connection arguments from GraphQL query
 * @return {Promise<Object>} `{ nodes, pageInfo, totalCount }`
 */
async function getPaginatedResponse(mongoCursor, args) {
  const { sortBy, sortOrder } = args;
  const baseFilter = mongoCursor.cmd.query;

  // Get the total count, prior to adding before/after filtering
  const totalCount = await mongoCursor.clone().count();

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

  // Get the new count after applying before/after
  const totalCountAfterOrBefore = await mongoCursor.clone().count();

  const { hasPreviousPage, hasNextPage } = await applyPaginationToMongoCursor(mongoCursor, args, totalCountAfterOrBefore);

  // Figure out proper hasNext/hasPrevious
  const pageInfo = {
    hasPreviousPage: hasPreviousPage === null ? hasMore : hasPreviousPage,
    hasNextPage: hasNextPage === null ? hasMore : hasNextPage
  };

  const nodes = await mongoCursor.toArray();
  const count = nodes.length;
  if (count) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[count - 1]._id;
  }

  return { nodes, pageInfo, totalCount };
}

export default getPaginatedResponse;
