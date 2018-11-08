import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import createFlatRateFulfillmentRestrictionMutation from "../../mutations/createFlatRateFulfillmentRestriction";

/**
 * @name "Mutation.createFlatRateFulfillmentMethod"
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the createFlatRateFulfillmentMethod GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.method - The method object
 * @param {String} args.input.shopId - The shop to create this flat rate fulfillment method for
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} CreateFlatRateFulfillmentMethodPayload
 */
export default async function createFlatRateFulfillmentRestriction(parentResult, { input }, context) {
  const { clientMutationId = null, restriction, shopId: opaqueShopId } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const { restriction: insertedRestriction } = await createFlatRateFulfillmentRestrictionMutation(context, {
    restriction,
    shopId
  });

  return {
    clientMutationId,
    restriction: insertedRestriction
  };
}
