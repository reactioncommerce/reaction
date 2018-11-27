import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCreditOffDiscount from "./server/no-meteor/util/getCreditOffDiscount";
import getItemPriceDiscount from "./server/no-meteor/util/getItemPriceDiscount";
import getPercentageOffDiscount from "./server/no-meteor/util/getPercentageOffDiscount";
import getShippingDiscount from "./server/no-meteor/util/getShippingDiscount";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Codes",
  name: "discount-codes",
  icon: "fa fa-gift",
  autoEnable: true,
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
