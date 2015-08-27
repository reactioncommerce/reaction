ReactionCore.registerPackage({
  label: "Shipping",
  name: 'reaction-shipping',
  autoEnable: true,
  settings: {
    name: "Flat Rate Service"
  },
  registry: [
    {
      provides: 'dashboard',
      label: 'Basic Shipping',
      description: 'Use flat rates for shipping calculations',
      icon: 'fa fa-truck',
      cycle: 3,
      group: "reaction-shipping"
    }, {
      label: "Shipping Settings",
      i18nLabel: "app.shippingSettings",
      route: 'shipping',
      provides: 'settings',
      group: "reaction-shipping",
      template: 'shippingSettings'
    }, {
      template: 'flatRateCheckoutShipping',
      provides: 'shippingMethod'
    }
  ]
});
