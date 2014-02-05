Meteor.app.packages.register
  name: 'reaction-commerce'
  depends: ['orderManager', 'fileUploader', 'staffAccountsManager']
  label: 'Shop'
  description: 'Reaction Shop'
  icon: 'fa fa-shopping-cart fa-5x'
  settingsRoute: 'dashboard/settings/shop'
  overviewRoute: 'dashboard/welcome'
  priority: '3'
  hasWidget: true
  shopPermissions: [
    {
      label: "Customers"
      permission: "dashboard/customers"
      group: "Shop Management"
    }
    {
      label: "Promotions"
      permission: "dashboard/promotions"
      group: "Shop Management"
    }
    {
      label: "Products"
      permission: "dashboard/products"
      group: "Shop Content"
    }
    {
      label: "General Shop"
      permission: "dashboard/settings"
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
  label: 'Dashboard Access'
  settingsRoute: 'dashboard/settings/account'
  hasWidget: false
  shopPermissions: [
    {
      label: "Dashboard Access"
      permission: "dashboard/settings/account"
      group: "Shop Settings"
    }
  ]
