import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import getSlug from "/imports/plugins/core/core/server/Reaction/getSlug";

const inputSchema = new SimpleSchema({
  "slug": String,
  "name": String,
  "displayTitle": String,
  "isVisible": Boolean,
  "metafields": { type: Array, optional: true },
  "metafields.$": new SimpleSchema({
    key: { type: String, max: 30 },
    namespace: { type: String, max: 20 },
    value: { type: String }
  }),
  "featuredProductIds": { type: Array, optional: true },
  "featuredProductIds.$": String
}, { requiredByDefault: false });

/**
 * @name Mutation.updateTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @return {Promise<Object>} UpdateTagPayload
 */
export default async function updateTag(context, input) {
  const { collections, userHasPermission } = context;
  const { Tags } = collections;
  const { clientMutationId, shopId, tagId } = input;

  // Check for owner or admin permissions from the user before allowing the mutation
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const params = {
    slug: getSlug(input.name),
    name: input.name,
    displayTitle: input.displayTitle,
    isVisible: input.isVisible,
    metafields: input.metafields,
    featuredProductIds: input.featuredProductIds
  };

  if (params.type === "rewrite") params.status = null;
  inputSchema.validate(params);
  params.updatedAt = new Date();

  const { result } = await Tags.updateOne(
    { _id: tagId, shopId },
    { $set: params }
  );

  if (result.n === 0) {
    throw new ReactionError("not-found", "Redirect rule not found");
  }

  const tag = await Tags.findOne({ _id: tagId, shopId });

  return {
    clientMutationId,
    tag
  };
}
