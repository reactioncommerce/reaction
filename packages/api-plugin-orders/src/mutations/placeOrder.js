import prepareOrder from "../util/orderValidators/prepareOrder.js";

/**
 * @method placeOrder
 * @summary Places an order, authorizing all payments first
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @returns {Promise<Object>} Object with `order` property containing the created order
 */
export default async function placeOrder(context, input) {
  const { appEvents, collections: { Orders }, userId } = context;

  const { order, fullToken } = await prepareOrder(context, input, "createOrderObject");
  await Orders.insertOne(order);

  await appEvents.emit("afterOrderCreate", { createdBy: userId, order });

  return {
    orders: [order],
    // GraphQL response gets the raw token
    token: fullToken && fullToken.token
  };
}
