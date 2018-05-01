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
  const baseFilterIsEmpty = Object.keys(baseFilter).length === 0;
  const limits = {};
  const ors = [];

  if (typeof sortByField !== "string") throw new Error("sortBy is required");
  if (sortOrder !== "asc" && sortOrder !== "desc") throw new Error("sortOrder is required");

  if (after && before) throw new Error("Including both 'after' and 'before' params is not allowed");

  if (!after && !before) return filter;

  let internalId;
  let op;
  if (before) {
    internalId = before;
    op = (sortOrder === "desc" ? "$gt" : "$lt");
  } else {
    internalId = after;
    op = (sortOrder === "desc" ? "$lt" : "$gt");
  }

  if (sortByField === "_id") {
    // We already have _id. Skip the lookup
    if (baseFilterIsEmpty) {
      filter = { _id: { [op]: internalId } };
    } else {
      filter = {
        $and: [
          { ...filter },
          { _id: { [op]: internalId } }
        ]
      };
    }
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

      if (baseFilterIsEmpty) {
        filter = {
          $or: [
            {
              [sortByField]: limits
            },
            ...ors
          ]
        };
      } else {
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
  }

  return filter;
}
