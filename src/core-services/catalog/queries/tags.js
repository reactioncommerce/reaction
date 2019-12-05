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
 * @param {Boolean} [params.excludedTagIds] - If set, exclude these tagIds from the result
 * @returns {Promise<MongoCursor>} - A MongoDB cursor for the proper query
 */
export default async function tags(
  context,
  shopId,
  {
    filter,
    shouldIncludeDeleted = false,
    isTopLevel,
    shouldIncludeInvisible = false,
    excludedTagIds
  } = {}
) {
  const { collections } = context;
  const { Tags } = collections;
  const query = { shopId };
  let searchFieldFilter = {};
  let regexMatch;

  // Check to make sure user has `read` permissions for this tag
  await context.validatePermissions("reaction:tags", "read", {
    shopId,
    legacyRoles: ["admin", "owner", "tags"]
  });

  // Check to see if user has `read` permissions for hidden / deleted tags
  // TODO(pod-auth): revisit using `inactive` in resource, and revisit the word `inactive`
  const hasInactivePermissions = await context.userHasPermission("reaction:tags:inactive", "read", {
    shopId,
    legacyRoles: ["admin", "owner", "tags"]
  });

  if (isTopLevel === false || isTopLevel === true) query.isTopLevel = isTopLevel;

  // Use `filter` to filter out results on the server
  if (filter) {
    regexMatch = { $regex: _.escapeRegExp(filter), $options: "i" };
    searchFieldFilter = {
      $or: [
        { name: regexMatch },
        { slug: regexMatch }
      ]
    };
  }

  if (Array.isArray(excludedTagIds)) {
    query._id = {
      $nin: excludedTagIds
    };
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

  return Tags.find({
    ...query,
    ...searchFieldFilter
  });
}
