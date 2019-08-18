import { decodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { decodePaymentOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/payment";

/**
 * @name Mutation/createRefund
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the createRefund GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.amount - amount to refund
 * @param {Object} args.input.orderId - order ID of order where payment was applied
 * @param {Object} args.input.paymentId - ID of payment to refund
 * @param {Object} [args.input.reason] - reason for refund
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} createRefundPayload
 */
export default async function createRefund(_, { input }, context) {
  const {
    amount,
    clientMutationId = null,
    orderId,
    paymentId,
    reason
  } = input;

  const { order } = await context.mutations.createRefund(context, {
    amount,
    orderId: decodeOrderOpaqueId(orderId),
    paymentId: decodePaymentOpaqueId(paymentId),
    reason
  });

  return {
    clientMutationId,
    order
  };
}
