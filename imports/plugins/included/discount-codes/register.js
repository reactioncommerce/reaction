import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Codes",
  name: "discount-codes",
  icon: "fa fa-gift",
  autoEnable: true,
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
