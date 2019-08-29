/**
 * @name applyBeforeAfterToFilter
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Adjusts a MongoDB filter based on GraphQL `before` and `after` params
 * @param {Object} args object of arguments passed
 * @param {Object} [args.after] A document that all results should be filtered to be after.
 * @param {Object} [args.baseFilter] The MongoDB filter object to extend.
 * @param {Object} [args.before] A document that all results should be filtered to be before.
 * @param {String} [args.sortBy] The name of the field we are sorting by. Default _id
 * @param {String} [args.sortOrder] The sort order, "asc" or "desc". Default "asc"
 * @returns {Object} The potentially-modified filter object
 */
export default function applyBeforeAfterToFilter({
  after,
  baseFilter = {},
  before,
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

  let doc;
  let op;
  if (before) {
    doc = before;
    op = (sortOrder === "desc" ? "$gt" : "$lt");
  } else {
    doc = after;
    op = (sortOrder === "desc" ? "$lt" : "$gt");
  }

  const internalId = doc._id;

  if (sortByField === "_id") {
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

  return filter;
}
