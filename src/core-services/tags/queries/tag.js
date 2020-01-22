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

  // Check to see if user has `read` permissions for hidden / deleted tags
  const hasInactivePermissions = await context.userHasPermission(`reaction:legacy:tags:${slugOrId}`, "read:inactive", {
    shopId
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
