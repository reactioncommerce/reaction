import _ from "lodash";

/**
 * @name tags
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection by shop ID and optionally by isTopLevel
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of shop to query
 * @param {Object} [params] - Additional options for the query
 * @param {Boolean} [params.filter] - If provided, look for `filter` matching this value with regex
 * @param {Boolean} [params.isTopLevel] - If set, look for `isTopLevel` matching this value
 * @param {Boolean} [params.shouldIncludeDeleted] - Admin only. Whether or not to include `isDeleted=true` tags. Default is `false`
 * @param {Boolean} [params.shouldIncludeInvisible] - Admin only. Whether or not to include `isVisible=false` tags.  Default is `false`.
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tags(context, shopId, { filter, shouldIncludeDeleted = false, isTopLevel, shouldIncludeInvisible = false } = {}) {
  const { collections } = context;

  const { Tags } = collections;
  const query = { shopId };

  if (isTopLevel === false || isTopLevel === true) query.isTopLevel = isTopLevel;

  // Use `filter` to filter out results on the server
  if (filter) {
    query.name = { $regex: _.escapeRegExp(filter), $options: "i" };
  }

  if (context.userHasPermission(["owner", "admin"], shopId)) {
    if (shouldIncludeDeleted === true) {
      delete query.isDeleted;
    } else {
      query.isDeleted = false;
    }
    if (shouldIncludeInvisible === true) {
      delete query.isVisible;
    } else {
      query.isVisible = true;
    }
  } else {
    query.isDeleted = false;
    query.isVisible = true;
  }

  return Tags.find(query);
}
