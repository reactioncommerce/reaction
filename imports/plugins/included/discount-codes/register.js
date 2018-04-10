import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Codes",
  name: "discount-codes",
  icon: "fa fa-gift",
  autoEnable: true,
  settings: {
    "discount-codes": {
      enabled: false,
      support: []
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
