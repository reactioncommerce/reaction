import { createRequire } from "module";
import setDiscountsOnCart from "./util/setDiscountsOnCart.js";
import actions from "./actions/index.js";
import methods from "./methods/index.js";
import enhancers from "./enhancers/index.js";
import addDiscountToOrderItem from "./util/discountTypes/item/addDiscountToOrderItem.js";
import getCartDiscountTotal from "./util/discountTypes/order/getCartDiscountTotal.js";
import getItemDiscountTotal from "./util/discountTypes/item/getItemDiscountTotal.js";
import getShippingDiscountTotal from "./util/discountTypes/shipping/getShippingDiscountTotal.js";
import getGroupDiscountTotal from "./util/discountTypes/shipping/getGroupDisountTotal.js";
import applyDiscountsToRates from "./util/discountTypes/shipping/applyDiscountsToRates.js";
import preStartup from "./preStartup.js";
import recalculateDiscounts from "./xforms/recalculateDiscounts.js";
import { discountCalculationMethods, registerDiscountCalculationMethod } from "./registration.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Promotions-Discounts",
    name: pkg.name,
    version: pkg.version,
    functionsByType: {
      registerPluginHandler: [registerDiscountCalculationMethod],
      preStartup: [preStartup],
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
    contextAdditions: {
      discountCalculationMethods
    },
    promotions: {
      actions,
      enhancers
    },
    discountCalculationMethods: methods
  });
}
