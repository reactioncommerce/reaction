import { decodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeSurchargeOpaqueId } from "../../xforms/surcharge.js";
import updateSurchargeMutation from "../../mutations/updateSurcharge.js";

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

  const shopId = decodeShopOpaqueId(opaqueShopId);
  const surchargeId = decodeSurchargeOpaqueId(opaqueSurchargeId);

  let decodedMethodIds = [];
  if (surcharge.methodIds && Array.isArray(surcharge.methodIds)) {
    decodedMethodIds = surcharge.methodIds.map((methodId) => decodeFulfillmentMethodOpaqueId(methodId));
  }

  surcharge.methodIds = decodedMethodIds;

  const { surcharge: updatedSurcharge } = await updateSurchargeMutation(context, {
    surcharge,
    surchargeId,
    shopId
  });

  return {
    clientMutationId,
    surcharge: updatedSurcharge
  };
}
