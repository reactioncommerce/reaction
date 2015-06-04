ReactionCore.registerPackage
  name: 'reaction-shipping'
  autoEnable: true
  settings:
    name: "Flat Rate Service"
  registry: [
    {
      provides: 'dashboard'
      label: 'Basic Shipping'
      description: 'Use flat rates for shipping calculations'
      icon: 'fa fa-truck'
      cycle: 3
      group: "reaction-shipping"
    }
    {
      route: 'shipping'
      provides: 'settings'
      group: "reaction-shipping"
    }
    {
      template: 'flatRateCheckoutShipping'
      provides: 'shippingMethod'
    }
  ]
