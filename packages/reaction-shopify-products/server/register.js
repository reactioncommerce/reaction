ReactionCore.registerPackage({
  label: 'Import Shopify Products',
  name: 'reaction-shopify-products',
  icon: 'fa fa-download',
  autoEnable: true,
  registry: [
    // Dashboard card
    {
      provides: 'dashboard',
      label: 'Shopify Products',
      description: 'Import Products From Shopify',
      route: 'dashboard/shopify-products',
      icon: 'fa fa-download',
      cycle: '3',
      container: 'dashboard'
    },

    // Settings panel
    {
      label: 'Shopify Products Settings',
      route: 'dashboard/shopify-products',
      provides: 'settings',
      container: 'dashboard',
      template: 'shopifyProductsSettings'
    }
  ],
  permissions: [
    {
      label: 'Shopify Products',
      permission: 'dashboard/shopify-products',
      group: 'Shop Settings'
    }
  ]
});
