import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Rates",
  name: "discount-rates",
  icon: "fa fa-gift",
  settings: {
    "discount-rates": {
      enabled: false
    }
  },
  registry: [
    {
      label: "Rates",
      provides: ["catalogSettings"],
      template: "customDiscountRates"
    }
  ]
});
