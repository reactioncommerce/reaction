import getCreditOffDiscount from "./util/getCreditOffDiscount";
import getItemPriceDiscount from "./util/getItemPriceDiscount";
import getPercentageOffDiscount from "./util/getPercentageOffDiscount";
import getShippingDiscount from "./util/getShippingDiscount";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Codes",
    name: "discount-codes",
    icon: "fa fa-gift",
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
