import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name tag
 * @method
 * @memberof Catalog/NoMeteorQueries
 * @summary query the Tags collection and return a tag by tag ID or slug
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input input of tag query
 * @param {String} input.shopId - shopId of tag
 * @param {String} input.slugOrId - ID or slug of tag to query
 * @param {Boolean} [input.shouldIncludeInvisible] - Whether or not to include `isVisible=true` tags. Default is `false`
 * @returns {Object} - A Tag document if one was found
 */
export default async function tag(context, input) {
  const { collections } = context;
  const { Tags } = collections;
  const { slugOrId, shopId, shouldIncludeInvisible = false } = input;

  // Check to make sure user has `read` permissions for this tag
  // TODO(auth-pod): revisit this check once legacyRoles are removed
  // await context.validatePermissions("reaction:legacy:tags:${slugOrId}", "read", {
  //   shopId,
  //   legacyRoles: ["admin", "owner", "tags", "any"]
  // });

  // Check to see if user has `read` permissions for hidden / deleted tags
  // TODO(pod-auth): revisit using `inactive` in resource, and revisit the word `inactive`
  const hasInactivePermissions = await context.userHasPermission(`reaction:tags:${slugOrId}:inactive`, "read", {
    shopId,
    legacyRoles: ["admin", "owner"]
  });

  let query = {
    $and: [
      { isVisible: true },
      { shopId },
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
