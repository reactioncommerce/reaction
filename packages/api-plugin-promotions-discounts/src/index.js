import { createRequire } from "module";
import actions from "./actions/index.js";
import methods from "./methods/index.js";
import queries from "./queries/index.js";
// import getCartDiscountTotal from "./utils/getCartDiscountTotal.js";
// import getItemDiscountTotal from "./utils/getItemDiscountTotal.js";
// import getShippingDiscountTotal from "./discountTypes/shipping/getShippingDiscountTotal.js";
import getGroupDiscountTotal from "./discountTypes/shipping/getGroupDisountTotal.js";
import applyDiscountsToRates from "./discountTypes/shipping/applyDiscountsToRates.js";
import addDiscountToOrderItem from "./utils/addDiscountToOrderItem.js";
import preStartup from "./preStartup.js";
import { discountCalculationMethods, registerDiscountCalculationMethod } from "./registration.js";
import getTotalDiscountOnCart from "./utils/getTotalDiscountOnCart.js";

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
      calculateDiscountTotal: [getTotalDiscountOnCart],
      getGroupDiscounts: [getGroupDiscountTotal],
      applyDiscountsToRates: [applyDiscountsToRates]
    },
    queries,
    contextAdditions: {
      discountCalculationMethods
    },
    promotions: {
      actions
    },
    discountCalculationMethods: methods
  });
}
