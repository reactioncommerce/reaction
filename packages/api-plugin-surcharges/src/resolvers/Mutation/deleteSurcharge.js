import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId, decodeSurchargeOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/deleteSurcharge
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the deleteSurcharge GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.surchargeId - The ID of the surcharge you want to delete
 * @param {String} args.input.shopId - The shop to delete this surcharge for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} DeleteSurchargePayload
 */
export default async function deleteSurcharge(parentResult, { input }, context) {
  const { clientMutationId = null, surchargeId: opaqueSurchargeId, shopId: opaqueShopId } = input;

  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;
  const surchargeId = isOpaqueId(opaqueSurchargeId) ? decodeSurchargeOpaqueId(opaqueSurchargeId) : opaqueSurchargeId;

  const { surcharge } = await context.mutations.deleteSurcharge(context, {
    surchargeId,
    shopId
  });

  return {
    clientMutationId,
    surcharge
  };
}
