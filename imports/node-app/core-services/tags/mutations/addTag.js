import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import { Tag as TagSchema } from "../simpleSchemas.js"; // TODO: update schemas

/**
 * @name Mutation.addTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Object>} AddTagPayload
 */
export default async function addTag(context, input) {
  // Check for owner or admin permissions from the user before allowing the mutation
  const { shopId, name, isVisible, displayTitle, metafields, heroMediaUrl, slug: slugInput } = input;
  const { appEvents, collections, userHasPermission } = context;
  const { Tags } = collections;

  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  let slug = name;
  if (typeof slugInput === "string" && slugInput.trim().length > 0) {
    slug = slugInput;
  }

  const now = new Date();
  const tag = {
    _id: Random.id(),
    isDeleted: false,
    isTopLevel: false,
    isVisible,
    slug: getSlug(slug),
    metafields,
    name,
    displayTitle,
    heroMediaUrl,
    shopId,
    createdAt: now,
    updatedAt: now
  };

  TagSchema.validate(tag);

  try {
    const { result } = await Tags.insertOne(tag);

    if (result.ok !== 1) {
      throw new ReactionError("server-error", "Unable to create tag");
    }

    await appEvents.emit("afterTagCreate", tag);

    return tag;
  } catch ({ message }) {
    // Mongo duplicate key error.
    if (message.includes("E11000") && message.includes("slug")) {
      throw new ReactionError("error", `Slug ${tag.slug} is already in use`);
    }

    throw new ReactionError("error", message);
  }
}
