import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeSurchargeOpaqueId } from "../../xforms/surcharge.js";
import deleteSurchargeMutation from "../../mutations/deleteSurcharge.js";

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

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const surchargeId = decodeSurchargeOpaqueId(opaqueSurchargeId);

  const { surcharge } = await deleteSurchargeMutation(context, {
    surchargeId,
    shopId
  });

  return {
    clientMutationId,
    surcharge
  };
}
