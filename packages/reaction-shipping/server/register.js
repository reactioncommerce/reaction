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
      description: "Provide shipping rates",
      icon: "fa fa-truck",
      priority: 2,
      group: "reaction-shipping",
      template: "shipping"
    },
    {
      label: "Shipping Settings",
      route: "dashboard/shipping/settings",
      provides: "settings",
      group: "reaction-shipping",
      template: "shippingProviderTable"
    },
    {
      template: "flatRateCheckoutShipping",
      provides: "shippingMethod"
    }
  ]
});
