import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { Tag as TagSchema } from "/imports/collections/schemas";
import getSlug from "/imports/plugins/core/core/server/Reaction/getSlug";

/**
 * @name Mutation.addTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @return {Promise<Object>} AddTagPayload
 */
export default async function addTag(context, input) {
  // Check for owner or admin permissions from the user before allowing the mutation
  const { shopId, name, isVisible, displayTitle, metafields } = input;
  const { appEvents, collections, userHasPermission } = context;
  const { Tags } = collections;

  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const now = new Date();
  const tag = {
    _id: Random.id(),
    isDeleted: false,
    isTopLevel: false,
    isVisible,
    slug: getSlug(name),
    metafields,
    name,
    displayTitle,
    shopId,
    createdAt: now,
    updatedAt: now
  };

  TagSchema.validate(tag);
  const { result } = await Tags.insertOne(tag);

  if (result.ok !== 1) {
    throw new ReactionError("server-error", "Unable to create tag");
  }

  await appEvents.emit("afterTagCreate", tag);

  return tag;
}
