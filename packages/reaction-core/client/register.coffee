ReactionCore.Packages.register
  name: 'reaction-commerce'
  depends: ['fileUploader', 'staffAccountsManager','paymentMethod', 'mailService', 'analytics', 'shipmentMethod']
  label: 'Settings'
  description: 'Reaction Shop'
  icon: 'fa fa-shopping-cart'
  settingsRoute: 'dashboard/settings/shop'
  overviewRoute: 'dashboard'
  overViewLabel: 'App Gallery'
  priority: '3'
  hidden: true
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

ReactionCore.Packages.register
  name: 'reaction-commerce-orders'
  provides: ['orderManager']
  label: 'Orders'
  overviewRoute: 'dashboard/orders'
  hasWidget: true
  hidden: true

  shopPermissions: [
    {
      label: "Orders"
      permission: "dashboard/orders"
      group: "Shop Management"
    }
  ]

ReactionCore.Packages.register
  name: 'reaction-commerce-staff-accounts'
  provides: ['staffAccountsManager']
  label: 'Admin Access'
  settingsRoute: 'dashboard/settings/account'
  hidden: true
  shopPermissions: [
    {
      label: "Dashboard Access"
      permission: "dashboard/settings/account"
      group: "Shop Settings"
    }
  ]
