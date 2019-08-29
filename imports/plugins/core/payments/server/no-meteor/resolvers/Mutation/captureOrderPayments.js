import { decodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { decodePaymentOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/payment";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/captureOrderPayments
 * @method
 * @memberof Payment/GraphQL
 * @summary resolver for the captureOrderPayments GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {String} args.input.orderId - The order ID
 * @param {String[]} args.input.paymentIds - An array of one or more payment IDs to capture
 * @param {String} args.input.shopId - The ID of the shop that owns this order
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CaptureOrderPaymentsPayload
 */
export default async function captureOrderPayments(parentResult, { input }, context) {
  const { clientMutationId, orderId: opaqueOrderId, paymentIds: opaquePaymentIds, shopId: opaqueShopId } = input;

  const orderId = decodeOrderOpaqueId(opaqueOrderId);
  const paymentIds = opaquePaymentIds.map(decodePaymentOpaqueId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const { order } = await context.mutations.captureOrderPayments(context, {
    orderId,
    paymentIds,
    shopId
  });

  return {
    clientMutationId,
    order
  };
}
