import { decodeProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/product";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/createMediaRecord
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the createMediaRecord GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.mediaRecord - MediaRecordInput
 * @param {Object} args.input.shopId - Opaque Shop ID
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateMediaRecordPayload
 */
export default async function createMediaRecord(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    mediaRecord: mediaRecordInput,
    shopId: opaqueShopId
  } = input;

  const mediaRecord = await context.mutations.createMediaRecord(context, {
    mediaRecord: {
      metadata: {
        ...mediaRecordInput.metadata,
        productId: decodeProductOpaqueId(mediaRecordInput.metadata.productId),
        variantId: decodeProductOpaqueId(mediaRecordInput.metadata.variantId)
      },
      original: mediaRecordInput.original
    },
    shopId: decodeShopOpaqueId(opaqueShopId)
  });

  return {
    clientMutationId,
    mediaRecord
  };
}
