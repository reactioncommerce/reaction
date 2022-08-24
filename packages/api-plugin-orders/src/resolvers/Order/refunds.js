/**
 * @name Order/refunds
 * @method
 * @memberof Order/GraphQL
 * @summary Returns refunds applied to an order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} order order object refunds would be applied to
 * @returns {Promise<Object[]>} Promise that resolves with array of refund objects
 */
export default async function refunds(context, order) {
  return context.queries.refunds(context, {
    orderId: order._id,
    shopId: order.shopId,
    token: order.token || null
  });
}
