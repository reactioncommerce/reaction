import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  name: String,
  displayTitle: String,
  isVisible: Boolean
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
    name: input.name,
    displayTitle: input.displayTitle,
    isVisible: input.isVisible
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
