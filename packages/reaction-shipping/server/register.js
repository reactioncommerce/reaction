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
      label: "Basic Shipping",
      description: "Use flat rates for shipping calculations",
      i18nKeyLabel: "admin.dashboard.shippingLabel",
      i18nKeyDescription: "admin.dashboard.shippingDescription",
      icon: "fa fa-truck",
      cycle: 3,
      group: "reaction-shipping"
    },
    {
      label: "Shipping Settings",
      i18nKeyLabel: "admin.settings.shipping",
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
