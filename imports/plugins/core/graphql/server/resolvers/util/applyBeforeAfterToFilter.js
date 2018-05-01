import { decodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

/**
 * @name applyBeforeAfterToFilter
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adjusts a MongoDB filter based on GraphQL `before` and `after` params
 * @return {Promise<Object>} The potentially-modified filter object
 */
export default async function applyBeforeAfterToFilter({
  after,
  baseFilter = {},
  before,
  collection,
  sortBy: sortByField = "_id",
  sortOrder = "asc"
}) {
  let filter = baseFilter;
  const limits = {};
  const ors = [];

  if (typeof sortByField !== "string") throw new Error("sortBy is required");
  if (sortOrder !== "asc" && sortOrder !== "desc") throw new Error("sortOrder is required");

  if (after && before) throw new Error("Including both 'after' and 'before' params is not allowed");

  if (!after && !before) return filter;

  let encodedId;
  let op;
  if (before) {
    encodedId = before;
    op = (sortOrder === "desc" ? "$gt" : "$lt");
  } else {
    encodedId = after;
    op = (sortOrder === "desc" ? "$lt" : "$gt");
  }

  // "encodedId" is encoded twice. At this point the cursor has already been decoded
  // but we are still left with an encoded ID, which we'll now decode.
  let internalId;
  if (encodedId.endsWith("=")) {
    internalId = decodeOpaqueId(encodedId).id;
  } else {
    internalId = encodedId; // it was only encoded once
  }

  if (sortByField === "_id") {
    // We already have _id. Skip the lookup
    filter = {
      $and: [
        { ...filter },
        { _id: { [op]: internalId } }
      ]
    };
  } else {
    const doc = await collection.findOne({
      _id: internalId
    }, {
      fields: {
        [sortByField]: 1
      }
    });

    if (doc) {
      limits[op] = doc[sortByField];
      ors.push({
        [sortByField]: doc[sortByField],
        _id: { [op]: internalId }
      });

      filter = {
        $and: [
          { ...filter },
          {
            $or: [
              {
                [sortByField]: limits
              },
              ...ors
            ]
          }
        ]
      };
    }
  }

  return filter;
}
