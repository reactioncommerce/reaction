import i18n from "./i18n/index.js";
import getCreditOffDiscount from "./util/getCreditOffDiscount.js";
import getItemPriceDiscount from "./util/getItemPriceDiscount.js";
import getPercentageOffDiscount from "./util/getPercentageOffDiscount.js";
import getShippingDiscount from "./util/getShippingDiscount.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Codes",
    name: "discount-codes",
    i18n,
    functionsByType: {
      "discounts/codes/credit": [getCreditOffDiscount],
      "discounts/codes/discount": [getPercentageOffDiscount],
      "discounts/codes/sale": [getItemPriceDiscount],
      "discounts/codes/shipping": [getShippingDiscount],
      "startup": [startup]
    },
    registry: [
      {
        label: "Codes",
        provides: ["paymentSettings"],
        template: "customDiscountCodes"
      }, {
        provides: ["paymentMethod"],
        template: "discountCodesCheckout"
      }
    ]
  });
}
