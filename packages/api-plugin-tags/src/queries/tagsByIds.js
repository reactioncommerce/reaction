/**
 * @name tagsByIds
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection by a list of IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String[]} tagIds - tag IDs to get
 * @param {Object} [params] - Additional options for the query
 * @param {Boolean} [params.shouldIncludeDeleted] - Whether or not to include `isDeleted=true` tags. Default is `false`
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tagsByIds(context, tagIds, { shouldIncludeDeleted = false } = {}) {
  const { collections } = context;

  const { Tags } = collections;
  const query = { _id: { $in: tagIds } };

  if (shouldIncludeDeleted !== true) query.isDeleted = { $ne: true };

  return Tags.find(query);
}
