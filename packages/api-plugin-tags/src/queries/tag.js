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

  const foundTag = await Tags.findOne({
    $or: [{ _id: slugOrId }, { slug: slugOrId }],
    shopId
  });

  if (!foundTag) {
    throw new ReactionError("not-found", `Tag ${slugOrId} not found`);
  }

  // Check to see if user has `read` permissions for invisible tags
  const hasInactivePermissions = await context.userHasPermission(`reaction:legacy:tags:${foundTag._id}`, "read:invisible", {
    shopId
  });

  // if tag is invisible, only show if `hasInactivePermissions === true` && `shouldIncludeInvisible === true`
  if (foundTag.isVisible === false && (hasInactivePermissions === false || shouldIncludeInvisible === false)) {
    throw new ReactionError("not-found", `Tag ${slugOrId} not found`);
  }

  return foundTag;
}
