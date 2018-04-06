/**
 * @name tagsByIds
 * @method
 * @summary query the Tags collection by shop ID and optionally by isTopLevel
 * @param {Object} context - an object containing the per-request state
 * @param {String[]} tagIds - tag IDs to get
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tagsByIds(context, tagIds, { includeDeleted = false } = {}) {
  const { collections } = context;

  // Note that we currently do not need a permission check here because we've already checked by the time we use this query

  const { Tags } = collections;
  const query = { _id: { $in: tagIds } };

  if (includeDeleted !== true) query.isDeleted = false;

  return Tags.find(query);
}
