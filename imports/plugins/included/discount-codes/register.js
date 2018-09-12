import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Codes",
  name: "discount-codes",
  icon: "fa fa-gift",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  },
  settings: {
    "discount-codes": {
      enabled: false
    }
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
