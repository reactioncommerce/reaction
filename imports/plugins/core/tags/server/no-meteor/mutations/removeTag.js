import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name Mutation.removeTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} RemoveTagPayload
 */
export default async function removeTag(context, input) {
  const { shopId, tagId } = input;
  const { userHasPermission } = context;
  const { Tags } = context.collections;

  // Check for owner or admin permissions from the user before allowing the mutation
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const tag = await Tags.findOne({ _id: tagId, shopId });
  const { result } = await Tags.deleteOne({ _id: tagId, shopId });

  if (result.n === 0) {
    throw new ReactionError("not-found", "Tag not found");
  }

  return tag;
}
