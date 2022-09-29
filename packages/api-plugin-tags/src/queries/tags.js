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
    createdAt,
    updatedAt,
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

  // Check to see if user has `read` permissions for hidden / deleted tags
  const hasInactivePermissions = await context.userHasPermission("reaction:legacy:tags", "read:invisible", {
    shopId
  });

  if (isTopLevel === false || isTopLevel === true) query.isTopLevel = isTopLevel;

  // Filter by createdAt
  if (createdAt) {
    const createdAtPredicates = [];
    if (createdAt.eq) {
      createdAtPredicates.push({
        createdAt: createdAt.eq
      });
    }
    if (createdAt.before) {
      createdAtPredicates.push({
        createdAt: {
          $lt: createdAt.before
        }
      });
    }
    if (createdAt.after) {
      createdAtPredicates.push({
        createdAt: {
          $gt: createdAt.after
        }
      });
    }
    if (createdAt.between) {
      const { start, end } = createdAt.between;
      createdAtPredicates.push({
        createdAt: {
          $gte: start,
          $lte: end
        }
      });
    }
    if (createdAtPredicates.length) {
      query.$and = [...(query.$and || []), ...createdAtPredicates];
    }
  }

  // Filter by updatedAt
  if (updatedAt) {
    const updatedAtPredicates = [];
    if (updatedAt.eq) {
      updatedAtPredicates.push({
        updatedAt: updatedAt.eq
      });
    }
    if (updatedAt.before) {
      updatedAtPredicates.push({
        updatedAt: {
          $lt: updatedAt.before
        }
      });
    }
    if (updatedAt.after) {
      updatedAtPredicates.push({
        updatedAt: {
          $gt: updatedAt.after
        }
      });
    }
    if (updatedAt.between) {
      const { start, end } = updatedAt.between;
      updatedAtPredicates.push({
        updatedAt: {
          $gte: start,
          $lte: end
        }
      });
    }
    if (updatedAtPredicates.length) {
      query.$and = [...(query.$and || []), ...updatedAtPredicates];
    }
  }

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
  if (!hasInactivePermissions || (hasInactivePermissions && !shouldIncludeInvisible)) {
    query.isVisible = true;
  }

  return Tags.find({
    ...query,
    ...searchFieldFilter
  });
}
