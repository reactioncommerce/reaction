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
  const { shopId, name, isVisible, displayTitle, metafields, heroMediaUrl, slug: slugInput } = input;
  const { appEvents, collections } = context;
  const { Tags } = collections;

  await context.validatePermissions("reaction:legacy:tags", "create", { shopId });

  let slug = name;
  if (typeof slugInput === "string" && slugInput.trim().length > 0) {
    slug = slugInput;
  }

  const allowedCharacters = "a-zA-Z0-9-/";
  const now = new Date();
  const tag = {
    _id: Random.id(),
    isDeleted: false,
    isTopLevel: false,
    isVisible,
    slug: getSlug(slug, allowedCharacters),
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
