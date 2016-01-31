ReactionCore.registerPackage({
  label: "Shipping",
  name: "reaction-shipping",
  icon: "fa fa-truck",
  autoEnable: true,
  settings: {
    name: "Flat Rate Service"
  },
  registry: [
    {
      provides: "dashboard",
      route: "dashboard/shipping",
      label: "Shipping",
      description: "Use flat rates for shipping",
      icon: "fa fa-truck",
      cycle: 1,
      group: "reaction-shipping"
    },
    {
      label: "Shipping Settings",
      route: "dashboard/shipping",
      provides: "settings",
      group: "reaction-shipping",
      template: "shippingSettings"
    },
    {
      template: "flatRateCheckoutShipping",
      provides: "shippingMethod"
    }
  ]
});
