import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import getPaginatedResponse from "./graphql/getPaginatedResponse.js";
import arrayJoinQuery from "./arrayJoinQuery";

const DEFAULT_LIMIT = 20;

/**
 * @summary Performs a MongoDB query where an array of IDs in one collection
 *   is used as the list and the list order, and the documents matching
 *   those IDs from another collection are returned. Also appends to this
 *   query the remaining documents from the joined collection.
 * @param {String} arrayFieldPath The field name or path in `collection`
 *   where the value is an array of IDs from the joinCollection
 * @param {Object} collection A MongoDB Collection instance
 * @param {Object} connectionArgs Relay-compatible connection arguments.
 *   `before` and `after` are document IDs from `joinCollection`.
 *   `sortBy` and `sortOrder` are ignored.
 * @param {String} positionFieldName A field with this name will be added to each document.
 *   The value will be a number indicating the document's position in the join array or
 *   null if it isn't in the array.
 * @param {String} joinCollection The collection instance, which
 *   contains the documents that will be returned.
 * @param {String} joinFieldPath The field name or path in `joinCollection` that is referenced
 *   by the items in the array at `arrayFieldPath`
 * @param {Object} joinSelector Mongo selector to use to limit the results from the joinCollection
 * @param {String} joinSortOrder Must be "asc" or "desc". The sort order for documents
 *   referenced in `arrayFieldPath`
 * @param {Object} [projection] An optional projection to limit the fields included
 *   from `joinCollection` collection.
 * @param {Object} selector MongoDB selector by which to look up the array
 *   field value in `collection`
 * @param {String} sortByForRemainingDocs The field to sort remaining (non-referenced) docs by
 * @param {String} sortOrderForRemainingDocs Must be "asc" or "desc". The direction in which to
 *   sort remaining (non-referenced) docs
 * @returns {Object[]} Array of found documents in correct sort
 */
export default async function arrayJoinPlusRemainingQuery({
  arrayFieldPath,
  collection,
  connectionArgs,
  joinCollection,
  joinFieldPath,
  joinSelector,
  joinSortOrder,
  positionFieldName,
  projection,
  selector,
  sortByForRemainingDocs,
  sortOrderForRemainingDocs
}) {
  const {
    after,
    before,
    first,
    last
  } = connectionArgs;

  if (first && last) throw new Error("Request either `first` or `last` but not both");

  const doc = await collection.findOne(selector, {
    projection: {
      [arrayFieldPath]: 1
    }
  });

  if (!doc) throw new ReactionError("not-found", `${collection.collectionName} not found`);

  // Enforce a `first: 20` limit if no user-supplied limit, using the DEFAULT_LIMIT
  const limit = first || last || DEFAULT_LIMIT;

  const isForwardPagination = !last;
  let hasNextPage = false;
  let hasPreviousPage = false;

  const cursor = joinCollection.find(joinSelector);

  // First get the list of documents from joinCollection explicitly listed in the array field.
  const idList = (doc[arrayFieldPath] || []);
  const arrayCount = idList.length;
  if (arrayCount) {
    const totalCount = await cursor.clone().count();

    // We can save ourselves some DB work when there are none
    if (!totalCount) {
      return {
        nodes: [],
        pageInfo: {
          hasPreviousPage,
          hasNextPage
        },
        totalCount
      };
    }

    let nodes;

    if (isForwardPagination) {
      const afterIndex = idList.indexOf(after);
      if (!after || afterIndex > -1) {
        nodes = await arrayJoinQuery({
          connectionArgs: {
            after,
            first: limit,
            sortOrder: joinSortOrder
          },
          joinArray: idList,
          joinCollection,
          joinFieldPath,
          joinSelector,
          positionFieldName,
          projection
        });
      } else {
        nodes = [];
      }

      // If we found fewer than requested and are forward paginating,
      // do a normal query for remaining
      if (nodes.length < limit) {
        const remainingDocsCursor = joinCollection.find({
          $and: [
            { [joinFieldPath]: { $nin: idList } },
            joinSelector
          ]
        });

        const result = await getPaginatedResponse(remainingDocsCursor, {
          after: afterIndex > -1 ? null : after,
          first: limit - nodes.length,
          sortBy: sortByForRemainingDocs,
          sortOrder: sortOrderForRemainingDocs
        }, {
          includeHasNextPage: true,
          includeHasPreviousPage: false,
          includeTotalCount: false
        });

        nodes.push(...result.nodes);

        ({ hasNextPage } = result.pageInfo);
        hasPreviousPage = !!(after && afterIndex !== 0);
      } else {
        hasNextPage = afterIndex > -1 ? afterIndex + nodes.length < totalCount : nodes.length < totalCount;
        hasPreviousPage = !!(after && afterIndex !== 0);
      }
    } else {
      // Backwards pagination
      const beforeIndex = idList.indexOf(before);

      // If the "before" ID is in the list, then we need only the query of that list.
      // We'll never need to add any additional docs to the results.
      if (beforeIndex > -1) {
        nodes = await arrayJoinQuery({
          connectionArgs: {
            before,
            last: limit,
            sortOrder: joinSortOrder
          },
          joinArray: idList,
          joinCollection,
          joinFieldPath,
          joinSelector,
          positionFieldName,
          projection
        });

        if (nodes.length) {
          hasPreviousPage = idList.indexOf(_.get(nodes[0], joinFieldPath)) !== 0;
        }

        if (before && beforeIndex < arrayCount - 1) {
          hasNextPage = true;
        } else if ((before && beforeIndex === arrayCount - 1) || !before) {
          hasNextPage = totalCount > arrayCount;
        }
      } else {
        // The "before" ID is not in the list. Start from the ID in the remaining docs
        // query or from the end of it. Then we'll add some joined docs from the end
        // of that list if necessary
        const remainingDocsCursor = joinCollection.find({
          $and: [
            { [joinFieldPath]: { $nin: idList } },
            joinSelector
          ]
        });

        const result = await getPaginatedResponse(remainingDocsCursor, {
          before,
          last: limit,
          sortBy: sortByForRemainingDocs,
          sortOrder: sortOrderForRemainingDocs
        }, {
          includeHasNextPage: true,
          includeHasPreviousPage: true,
          includeTotalCount: false
        });

        ({ nodes } = result);
        ({ hasNextPage, hasPreviousPage } = result.pageInfo);

        // We have to do this again after we know how many we got back,
        // if we didn't get enough back.
        if (arrayCount > 0 && nodes.length < limit) {
          const referencedNodes = await arrayJoinQuery({
            connectionArgs: {
              last: limit - nodes.length,
              sortOrder: joinSortOrder
            },
            joinArray: idList,
            joinCollection,
            joinFieldPath,
            joinSelector,
            positionFieldName,
            projection
          });

          nodes = referencedNodes.concat(nodes);

          if (nodes.length) {
            hasPreviousPage = idList.indexOf(_.get(nodes[0], joinFieldPath)) !== 0;
          }
        }
      }
    }

    const pageInfo = {
      hasPreviousPage,
      hasNextPage
    };

    const count = nodes.length;
    if (count) {
      pageInfo.startCursor = nodes[0]._id;
      pageInfo.endCursor = nodes[count - 1]._id;
    }

    return { nodes, pageInfo, totalCount };
  }

  // If there are no referenced documents
  return getPaginatedResponse(cursor, {
    ...connectionArgs,
    sortBy: sortByForRemainingDocs,
    sortOrder: "asc"
  });
}
