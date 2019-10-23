import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation.addTag
 * @method
 * @memberof Routes/GraphQL
 * @summary Add a tag
 * @param {Object} parentResult - unused
 * @param {Object} args.input - AddTagInput
 * @param {String} args.input.name - path to redirect from
 * @param {String} args.input.displayName - path to redirect to
 * @param {Boolean} args.input.isVisible - whether the tag is visible
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddTagPayload
 */
export default async function addTag(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    shopId: opaqueShopId,
    ...tagInput
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const tag = await context.mutations.addTag(context, {
    shopId,
    ...tagInput
  });

  return {
    clientMutationId,
    tag
  };
}
