import pkg from "../package.json" assert { type: "json" };
import actions from "./actions/index.js";
import methods from "./methods/index.js";
import queries from "./queries/index.js";
import schemas from "./schemas/index.js";
import stackabilities from "./stackabilities/index.js";
import addDiscountToOrderItem from "./utils/addDiscountToOrderItem.js";
import preStartup from "./preStartup.js";
import { discountCalculationMethods, registerDiscountCalculationMethod } from "./registration.js";
import getTotalDiscountOnCart from "./utils/getTotalDiscountOnCart.js";
import getApplicablePromotions from "./handlers/getApplicablePromotions.js";
import facts from "./facts/index.js";


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
      calculateDiscountTotal: [getTotalDiscountOnCart]
    },
    graphQL: {
      schemas
    },
    queries,
    contextAdditions: {
      discountCalculationMethods
    },
    promotions: {
      actions,
      stackabilities,
      getApplicablePromotions
    },
    discountCalculationMethods: methods,
    promotionOfferFacts: facts
  });
}
