ReactionCore.registerPackage({
  label: 'Rental Products',
  name: 'rental-products',
  autoEnable: true,
  registry: [
    {
      provides: 'dashboard',
      label: 'Rental Products',
      route: 'dashboard.rentalProducts',
      description: 'Enables Rental / For Hire Products',
      icon: 'fa fa-calendar',
      cycle: '3',
      container: 'rental-products'
    }, {
      provides: 'settings',
      label: 'Rental Product Settings',
      route: 'dashboard.rentalShopSettings',
      template: 'rentalShopSettings',
      container: 'rental-products'
    }, {
      route: 'createRentalType',
      label: 'Create Rental Product',
      icon: 'fa fa-plus',
      provides: 'shortcut'
    }
  ],
  permissions: [
    {
      label: 'Rentals',
      permission: 'ReactionCore.Collections.RentalTypes',
      group: 'Shop Settings'
    }
  ]
});
