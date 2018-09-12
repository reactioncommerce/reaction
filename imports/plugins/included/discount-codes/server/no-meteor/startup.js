import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections }) {
  const { Discounts } = collections;

  appEvents.on("afterOrderCreate", async (order) => {
    await Promise.all(order.discounts.map(async (orderDiscount) => {
      const { discountId } = orderDiscount;
      const transaction = {
        appliedAt: new Date(),
        cartId: order.cartId,
        userId: order.accountId
      };

      await Discounts.updateOne({ _id: discountId }, { $addToSet: { transactions: transaction } });
    }));
  });
}
