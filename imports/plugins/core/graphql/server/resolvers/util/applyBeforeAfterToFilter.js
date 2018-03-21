import { decodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

export default async function applyBeforeAfterToFilter({ after, baseFilter, before, collection, sortBy: sortByField, sortOrder }) {
  let filter = baseFilter;
  const limits = {};
  const ors = [];

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
  const internalId = decodeOpaqueId(encodedId).id;

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
