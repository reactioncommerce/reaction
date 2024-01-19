import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/enablePaymentMethodForShop
 * @method
 * @memberof Payment/GraphQL
 * @summary resolver for the enablePaymentMethodForShop GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - EnablePaymentMethodForShopInput
 * @param {String} args.input.isEnabled - Whether to enable or disable specified payment method
 * @param {String} args.input.paymentMethodName - The name of the payment method to enable or disable
 * @param {String} args.input.shopId - The id of the shop to enable payment method on
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Array<Object>>} EnablePaymentMethodForShopPayload
 */
export default async function enablePaymentMethodForShop(parentResult, { input }, context) {
  const { clientMutationId } = input;
  const paymentMethods = await context.mutations.enablePaymentMethodForShop(context, {
    ...input,
    shopId: isOpaqueId(input.shopId) ? decodeShopOpaqueId(input.shopId) : input.shopId
  });

  return {
    clientMutationId,
    paymentMethods
  };
}
