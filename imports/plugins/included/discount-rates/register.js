import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Rates",
  name: "discount-rates",
  icon: "fa fa-gift",
  autoEnable: true,
  settings: {
    rates: {
      enabled: false
    }
  },
  registry: [
    {
      label: "Rates",
      name: "discounts/settings/rates",
      provides: "discountSettings",
      template: "discountRatesSettings"
    }
  ]
});
