import appEvents from "/imports/node-app/core/util/appEvents";
import getPercentageOffDiscount from "./util/getPercentageOffDiscount";
import getCreditOffDiscount from "./util/getCreditOffDiscount";
import getItemPriceDiscount from "./util/getItemPriceDiscount";
import getShippingDiscount from "./util/getShippingDiscount";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections, registerFunction }) {
  const { Discounts } = collections;

  registerFunction("discounts/codes/discount", getPercentageOffDiscount);
  registerFunction("discounts/codes/credit", getCreditOffDiscount);
  registerFunction("discounts/codes/sale", getItemPriceDiscount);
  registerFunction("discounts/codes/shipping", getShippingDiscount);

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
