Meteor.app.packages.register
  name: 'reaction-commerce'
  depends: ['orderManager', 'fileUploader', 'staffAccountsManager']
  label: 'Shop'
  description: 'Reaction Shop'
  icon: 'fa fa-shopping-cart fa-5x'
  settingsRoute: 'shop/settings/general'
  overviewRoute: 'shop'
  priority: '3'
  hasWidget: true
  shopPermissions: [
    {
      label: "Customers"
      permission: "shop/customers"
      group: "Shop Management"
    }
    {
      label: "Promotions"
      permission: "shop/promotions"
      group: "Shop Management"
    }
    {
      label: "Products"
      permission: "shop/products"
      group: "Shop Content"
    }
    {
      label: "Collections"
      permission: "shop/collections"
      group: "Shop Content"
    }
    {
      label: "Settings"
      permission: "shop/settings/general"
      group: "Shop Settings"
    }
  ]

Meteor.app.packages.register
  name: 'reaction-commerce-orders'
  provides: ['orderManager']
  label: 'Orders'
  overviewRoute: 'dashboard/orders'
  hasWidget: false
  shopPermissions: [
    {
      label: "Orders"
      permission: "dashboard/orders"
      group: "Shop Management"
    }
  ]


Meteor.app.packages.register
  name: 'reaction-commerce-staff-accounts'
  provides: ['staffAccountsManager']
  label: 'Staff Accounts'
  settingsRoute: 'shop/settings/account'
  hasWidget: false
