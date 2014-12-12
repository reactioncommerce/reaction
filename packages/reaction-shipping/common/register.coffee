ReactionCore.registerPackage
  name: 'reaction-shipping'
  provides: ['shippingMethod']
  label: 'Basic Shipping'
  description: 'Use flat rates for shipping calculations'
  icon: 'fa fa-truck'
  settingsRoute: 'shipping'
  defaultSettings:
    name: "Flat Rate Service"
  priority: '2'
  hasWidget: true
  autoEnable: true
  shopPermissions: [
    {
      label: "Shipping"
      permission: "dashboard/shipping"
      group: "Shop Settings"
    }
  ]