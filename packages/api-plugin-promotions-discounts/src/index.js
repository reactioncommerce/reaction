import pkg from "../package.json";
import queries from "./queries/index.js";
import setDiscountsOnCart from "./util/setDiscountsOnCart.js";
import registerHandlers from "./handlers/registerHandlers.js";
import addDiscountToOrderItem from "./util/discountTypes/item/addDiscountToOrderItem.js";
import methods from "./methods/index.js";
import getCartDiscountTotal from "./util/discountTypes/order/getCartDiscountTotal.js";
import getItemDiscountTotal from "./util/discountTypes/item/getItemDiscountTotal.js";
import getShippingDiscountTotal from "./util/discountTypes/shipping/getShippingDiscountTotal.js";
import getGroupDiscountTotal from "./util/discountTypes/shipping/getGroupDisountTotal.js";
import applyDiscountsToRates from "./util/discountTypes/shipping/applyDiscountsToRates.js";
import preStartup from "./preStartup.js";
import recalculateDiscounts from "./xforms/recalculateDiscounts.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Promotions-Discounts",
    name: "promotion-discounts",
    version: pkg.version,
    queries,
    functionsByType: {
      preStartup: [preStartup],
      startup: [registerHandlers],
      mutateNewOrderItemBeforeCreate: [addDiscountToOrderItem],
      calculateDiscountTotal: [getCartDiscountTotal, getItemDiscountTotal, getShippingDiscountTotal],
      getGroupDiscounts: [getGroupDiscountTotal],
      applyDiscountsToRates: [applyDiscountsToRates]
    },
    cart: {
      transforms: [
        {
          name: "setDiscountsOnCart",
          fn: setDiscountsOnCart,
          priority: 10
        },
        {
          name: "recalculateDiscounts",
          fn: recalculateDiscounts,
          priority: 10
        }
      ]
    },
    promotions: {
      actions: ["cart-discounts"],
      methods
    }
  });
}
