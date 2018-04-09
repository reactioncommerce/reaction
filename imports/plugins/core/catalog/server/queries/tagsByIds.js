/**
 * @name tagsByIds
 * @method
 * @summary query the Tags collection by a list of IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String[]} tagIds - tag IDs to get
 * @param {Object} [params] - Additional options for the query
 * @param {Boolean} [params.includeDeleted] - Whether or not to include `isDeleted=true` tags. Default is `false`
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tagsByIds(context, tagIds, { includeDeleted = false } = {}) {
  const { collections } = context;

  const { Tags } = collections;
  const query = { _id: { $in: tagIds } };

  if (includeDeleted !== true) query.isDeleted = false;

  return Tags.find(query);
}
