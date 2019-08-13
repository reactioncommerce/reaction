import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

/**
 * @name Mutation.setTagHeroMedia
 * @method
 * @memberof Tags/GraphQL
 * @summary Set hero media for a tag
 * @param {Object} parentResult - unused
 * @param {Object} args.input - AddTagInput
 * @param {String} args.input.id - Tag ID
 * @param {String} args.input.shopId - ShopId of the tag
 * @param {Boolean} args.input.fileRecord - FileRecord document
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} SetTagHeroMediaPayload
 */
export default async function setTagHeroMedia(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    id: opaqueTagId,
    shopId: opaqueShopId,
    fileRecord
  } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const tagId = decodeTagOpaqueId(opaqueTagId);

  const tag = await context.mutations.setTagHeroMedia(context, {
    shopId,
    tagId,
    fileRecord
  });

  return {
    clientMutationId,
    tag
  };
}
