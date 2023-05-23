import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeFulfillmentMethodOpaqueId, decodeShopOpaqueId, decodeSurchargeOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/updateSurcharge
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the updateSurcharge GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.surchargeId - The ID of the surcharge you want to update
 * @param {Object} args.input.surcharge - The full updated surcharge object, without ID
 * @param {String} args.input.shopId - The shop to update this surcharge for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} updateSurchargePayload
 */
export default async function updateSurcharge(parentResult, { input }, context) {
  const { clientMutationId = null, surcharge, surchargeId: opaqueSurchargeId, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const surchargeId = isOpaqueId(opaqueSurchargeId) ? decodeSurchargeOpaqueId(opaqueSurchargeId) : opaqueSurchargeId;

  let decodedMethodIds = [];
  if (surcharge.methodIds && Array.isArray(surcharge.methodIds)) {
    decodedMethodIds = surcharge.methodIds.map((methodId) => (isOpaqueId(methodId) ? decodeFulfillmentMethodOpaqueId(methodId) : methodId));
  }

  surcharge.methodIds = decodedMethodIds;

  const { surcharge: updatedSurcharge } = await context.mutations.updateSurcharge(context, {
    surcharge,
    surchargeId,
    shopId
  });

  return {
    clientMutationId,
    surcharge: updatedSurcharge
  };
}
