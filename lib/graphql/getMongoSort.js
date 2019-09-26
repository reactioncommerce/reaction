const sortOrderEnumToMongo = {
  asc: 1,
  desc: -1
};

/**
 * Note that this uses the object format rather than the array format because our in-memory db
 * for tests expects object format. The Node `mongodb` package allows either.
 * Technically an array would be better because JS does not guarantee preservation of object key
 * order, but this seems to work fine.
 *
 * @name getMongoSort
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Converts GraphQL `sortBy` and `sortOrder` params to the sort object format
 *   that MongoDB uses.
 * @returns {Object} Sort object
 */
export default function getMongoSort({ sortBy, sortOrder } = {}) {
  const mongoSortDirection = sortOrderEnumToMongo[sortOrder || "asc"];
  if (sortBy && sortBy !== "_id") return { [sortBy]: mongoSortDirection, _id: mongoSortDirection };
  return { _id: mongoSortDirection };
}
