ReactionCore.registerPackage({
  label: 'Shopify Orders',
  name: 'reaction-shopify-orders',
  icon: 'fa fa-download',
  autoEnable: false,
  registry: [
    // Dashboard card
    {
      provides: 'dashboard',
      label: 'Shopify Orders',
      description: 'Import Shopify Orders',
      route: 'dashboard/shopify-orders',
      icon: 'fa fa-download',
      cycle: '3',
      container: 'dashboard'
    },

    // Settings panel
    {
      label: 'Shopify Orders Settings',
      route: 'dashboard/shopify-orders',
      provides: 'settings',
      container: 'dashboard',
      template: 'shopifyOrdersSettings'
    }
  ],
  permissions: [
    {
      label: 'Shopify Orders',
      permission: 'dashboard/shopify-orders',
      group: 'Shop Settings'
    }
  ]
});
