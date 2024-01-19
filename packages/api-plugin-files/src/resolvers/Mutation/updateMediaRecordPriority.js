import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeMediaRecordOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/updateMediaRecordPriority
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the updateMediaRecordPriority GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.mediaRecordId - Opaque MediaRecord ID
 * @param {String} args.input.priority - New priority value
 * @param {Object} args.input.shopId - Opaque Shop ID
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateMediaRecordPriorityPayload
 */
export default async function updateMediaRecordPriority(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    mediaRecordId: opaqueMediaRecordId,
    priority,
    shopId: opaqueShopId
  } = input;

  const mediaRecord = await context.mutations.updateMediaRecordPriority(context, {
    mediaRecordId: isOpaqueId(opaqueMediaRecordId) ? decodeMediaRecordOpaqueId(opaqueMediaRecordId) : opaqueMediaRecordId,
    priority,
    shopId: isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId
  });

  return {
    clientMutationId,
    mediaRecord
  };
}
