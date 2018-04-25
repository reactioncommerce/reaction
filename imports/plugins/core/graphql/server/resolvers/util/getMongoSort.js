const sortOrderEnumToMongo = {
  asc: 1,
  desc: -1
};

/**
 * @name getMongoSort
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary Converts GraphQL `sortBy` and `sortOrder` params to the sort array format
 *   that MongoDB uses.
 * @return {Array[]} Sort array
 */
export default function getMongoSort({ sortBy, sortOrder } = {}) {
  const mongoSort = sortOrderEnumToMongo[sortOrder || "asc"];
  const sortList = [["_id", mongoSort]];
  if (sortBy && sortBy !== "_id") {
    sortList.unshift([sortBy, mongoSort]);
  }
  return sortList;
}
