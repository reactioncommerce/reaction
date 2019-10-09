/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections: { Discounts } } = context;

  appEvents.on("afterOrderCreate", async ({ order }) => {
    if (Array.isArray(order.discounts)) {
      await Promise.all(order.discounts.map(async (orderDiscount) => {
        const { discountId } = orderDiscount;
        const transaction = {
          appliedAt: new Date(),
          cartId: order.cartId,
          userId: order.accountId
        };

        await Discounts.updateOne({ _id: discountId }, { $addToSet: { transactions: transaction } });
      }));
    }
  });
}
