ReactionCore.registerPackage({
  label: 'Advanced Fulfillment',
  name: 'reaction-advanced-fulfillment',
  icon: 'fa fa-barcode',
  autoEnable: false,
  registry: [
    // Dashboard card
    {
      provides: 'dashboard',
      label: 'Advanced Fulfillment',
      description: 'Advanced Order Fulfillment Tracking',
      route: 'dashboard/advanced-fulfillment',
      icon: 'fa fa-barcode',
      cycle: '3',
      container: 'dashboard'
    },

    // Settings panel
    {
      label: 'Adavanced Fulfillment Settings',
      route: 'dashboard/advanced-fulfillment',
      provides: 'settings',
      container: 'dashboard',
      template: 'advancedFulfillmentSettings'
    }
  ],
  permissions: [
    {
      label: 'Advanced Fulfillment',
      permission: 'dashboard/advanced-fulfillment',
      group: 'Shop Settings'
    }
  ]
});
