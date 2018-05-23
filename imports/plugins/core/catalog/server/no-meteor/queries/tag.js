/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection by shop ID and optionally by isTopLevel
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of shop to query
 * @param {Object} [params] - Additional options for the query
 * @param {Boolean} [params.isTopLevel] - If set, look for `isTopLevel` matching this value
 * @param {Boolean} [params.shouldIncludeDeleted] - Whether or not to include `isDeleted=true` tags. Default is `false`
 * @return {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tag(context, tagId) {
  const { collections } = context;

  const { Tags } = collections;
  const query = { _id: tagId };

  return Tags.findOne(query);
}
