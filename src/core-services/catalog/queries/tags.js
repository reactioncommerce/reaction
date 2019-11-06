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

  // Check to make sure user has `read` permissions for this tag
  await context.validatePermissionsLegacy(["admin", "owner", "tags"], shopId);
  await context.validatePermissions("reaction:tags", "read", { shopId });

  // Check to see if user has `read` permissions for hidden / deleted tags
  // TODO(pod-auth): revisit using `inactive` in resource, and revisit the word `inactive`
  const hasInactivePermissions = context.userHasPermissionLegacy(["admin", "owner", "tags"], shopId) &&
    await context.userHasPermissions("reaction:tags:inactive", "read", { shopId });

  if (isTopLevel === false || isTopLevel === true) query.isTopLevel = isTopLevel;

  // Use `filter` to filter out results on the server
  if (filter) {
    query.name = { $regex: _.escapeRegExp(filter), $options: "i" };
  }

  // If user does not have `read-admin` permissions,
  // or they do but shouldIncludeDeleted === false
  // only show non deleted products
  if (!hasInactivePermissions || (hasInactivePermissions && !shouldIncludeDeleted)) {
    query.isDeleted = false;
  }

  // If user does not have `read-admin` permissions,
  // or they do but shouldIncludeInvisible === false
  // only show visible products
  if (hasInactivePermissions || (hasInactivePermissions && !shouldIncludeInvisible)) {
    query.isVisible = true;
  }

  return Tags.find(query);
}
