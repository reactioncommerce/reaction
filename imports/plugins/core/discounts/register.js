import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Discounts",
  name: "reaction-discounts",
  icon: "fa fa-gift",
  autoEnable: true,
  settings: {
    custom: {
      enabled: true
    },
    rates: {
      enabled: false
    }
  },
  registry: [
    {
      provides: "dashboard",
      name: "discounts",
      label: "Discounts",
      description: "Provide discount rates",
      icon: "fa fa-gift",
      priority: 3,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "DiscountSettings",
      name: "discounts/settings",
      provides: "settings",
      template: "discountSettings"
    },
    {
      template: "flatRateCheckoutDiscounts",
      provides: "discountMethod"
    }
  ]
});
