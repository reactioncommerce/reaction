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

  // Check to make sure user has `read` permissions for this tag
  await context.validatePermissionsLegacy(["admin", "owner", "tags"], shopId);
  await context.validatePermissions(`reaction:tags:${slugOrId}`, "read", { shopId });

  // Check to see if user has `read` permissions for hidden / deleted tags
  // TODO(pod-auth): revisit using `inactive` in resource, and revisit the word `inactive`
  const hasInactivePermissions = context.userHasPermissionLegacy(["admin", "owner", "tags"], shopId) &&
    await context.userHasPermissions(`reaction:tags:${slugOrId}:inactive`, "read", { shopId });

  let query = {
    $and: [
      { isVisible: true },
      { $or: [{ _id: slugOrId }, { slug: slugOrId }] }
    ]
  };

  if (hasInactivePermissions && shouldIncludeInvisible === true) {
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
