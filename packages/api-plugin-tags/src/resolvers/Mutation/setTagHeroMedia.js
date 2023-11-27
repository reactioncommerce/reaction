import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId, decodeTagOpaqueId } from "../../xforms/id.js";

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

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const tagId = isOpaqueId(opaqueTagId) ? decodeTagOpaqueId(opaqueTagId) : opaqueTagId;

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
