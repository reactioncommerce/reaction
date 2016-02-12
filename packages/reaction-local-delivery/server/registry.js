ReactionCore.registerPackage({
  label: 'Local Delivery',
  name: 'reaction-local-delivery',
  icon: 'fa fa-truck',
  autoEnable: false,
  registry: [
    // Dashboard card
    {
      provides: 'dashboard',
      label: 'Local Delivery',
      description: 'Local Delivery ',
      route: 'dashboard/local-delivery',
      icon: 'fa fa-truck',
      cycle: '3',
      container: 'dashboard'
    },

    // Settings panel
    {
      label: 'Local Delivery Settings',
      route: 'dashboard/local-delivery',
      provides: 'settings',
      container: 'dashboard',
      template: 'localDeliverySettings'
    }
  ],
  permissions: [
    {
      label: 'Local Delivery',
      permission: 'dashboard/local-delivery',
      group: 'Shop Settings'
    }
  ]
});
