import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeOrderOpaqueId, decodePaymentOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

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

  const orderId = isOpaqueId(opaqueOrderId) ? decodeOrderOpaqueId(opaqueOrderId) : opaqueOrderId;
  const paymentIds = opaquePaymentIds.map((opaquePaymentId) => (isOpaqueId(opaquePaymentId) ? decodePaymentOpaqueId(opaquePaymentId) : opaquePaymentId));
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

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
