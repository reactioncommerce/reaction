import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tag ID or slug
 * @param {Object} context - an object containing the per-request state
 * @param {String} slugOrId - ID or slug of tag to query
 * @param {Boolean} [params.shouldIncludeInvisible] - Whether or not to include `isVisible=true` tags. Default is `false`
 * @returns {Object} - A Tag document if one was found
 */
export default async function tag(context, slugOrId, { shouldIncludeInvisible = false } = {}) {
  const { collections } = context;
  const { Tags } = collections;
  const shopId = await context.queries.primaryShopId(context);

  // TODO(pod-auth): determine if `read-admin` is the best action here
  // Check to see if user has `read-admin` permissions
  const hasAdminReadPermissions = context.userHasPermissionLegacy(["admin", "owner", "tags"], shopId) &&
    await context.userHasPermissions("reaction:tags", "read-admin", { shopId });

  // If user doesn't have `read-admin` permissions,
  // make sure they at least have `read` permissions
  if (!hasAdminReadPermissions) {
    context.userHasPermissionLegacy(["admin", "owner", "tags"], shopId) &&
      await context.validatePermissions("reaction:tags", "read", { shopId });
  }

  let query = {
    $and: [
      { isVisible: true },
      { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
    ]
  };

  if (hasAdminReadPermissions && shouldIncludeInvisible === true) {
    query = {
      $or: [{ _id: slugOrId }, { slug: slugOrId }]
    };
  }

  const foundTag = await Tags.findOne(query);

  if (!foundTag) {
    throw new ReactionError("not-found", "Tag not found");
  }

  return foundTag;
}
