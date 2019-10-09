import { decodeFulfillmentMethodOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/fulfillment";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import createSurchargeMutation from "../../mutations/createSurcharge.js";

/**
 * @name Mutation/createSurcharge
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the createSurcharge GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.surcharge - The surcharge object
 * @param {String} args.input.shopId - The shop to create this surcharge for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateSurchargePayload
 */
export default async function createSurcharge(parentResult, { input }, context) {
  const { clientMutationId = null, surcharge, shopId: opaqueShopId } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  let decodedMethodIds = [];
  if (surcharge.methodIds && Array.isArray(surcharge.methodIds)) {
    decodedMethodIds = surcharge.methodIds.map((methodId) => decodeFulfillmentMethodOpaqueId(methodId));
  }

  surcharge.methodIds = decodedMethodIds;

  const { surcharge: insertedSurcharge } = await createSurchargeMutation(context, {
    surcharge,
    shopId
  });

  return {
    clientMutationId,
    surcharge: insertedSurcharge
  };
}
