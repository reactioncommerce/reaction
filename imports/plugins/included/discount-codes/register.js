import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Taxes",
  name: "discount-codes",
  icon: "fa fa-gift",
  autoEnable: true,
  settings: {
    codes: {
      enabled: false
    }
  },
  registry: [
    {
      label: "Codes",
      name: "discounts/settings/codes",
      provides: "discountSettings",
      template: "discountCodeSettings"
    }
  ]
});
