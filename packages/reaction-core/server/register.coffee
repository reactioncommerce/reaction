# Define register method
# this will get inserted by fixtures on fresh package install
#
ReactionCore.registerPackage = (packageInfo) ->
  ReactionRegistry.Packages[packageInfo.name] = packageInfo

# Register core packages
ReactionCore.registerPackage
  name: 'core'
  autoEnable: true
  registry: [
    {
      route: "dashboard"
      provides: 'dashboard'
      label: 'Core'
      description: 'Reaction Commerce Core'
      icon: 'fa fa-th'
      cycle: 1
      container: "dashboard"
    }
    {
      route: "dashboard"
      provides: 'shortcut'
      label: 'Dashboard'
      icon: 'fa fa-th'
      cycle: 1
    }
    {
      route: "dashboard"
      label: 'Dashboard'
      provides: 'console'
    }
    {
      route: "dashboard/settings/shop"
      provides: 'settings'
      icon: "fa fa-cog fa-2x fa-fw"
      container: 'dashboard'
    }
    # orders
    {
      route: "dashboard/orders"
      provides: 'dashboard'
      label: 'Orders'
      description: 'Fulfill your orders'
      icon: 'fa fa-sun-o'
      cycle: 3
      container: "orders"
    }
    {
      route: "dashboard/orders"
      provides: 'shortcut'
      label: 'Orders'
      description: 'Fulfill your orders'
      icon: 'fa fa-sun-o'
      cycle: 3
    }
    {
      route: "dashboard/orders"
      label: 'Orders'
      provides: 'console'
    }
    # order widgets
    {
      template: "coreOrderWidgets"
      provides: 'widget'
    }
    # products
    {
      route: 'createProduct'
      label: 'Create'
      icon: 'fa fa-plus'
      provides: 'shortcut'
    }
    # users
    {
      route: 'dashboard/settings/account'
      label: 'Organization Users'
      description: 'Manage administrative access to shop.'
      icon: 'fa fa-users'
      provides: 'dashboard'
      cycle: 3
    }
  ]
  # permissions map to shopPermissions
  permissions: [
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
      label: "Shop Settings"
      permission: "dashboard/settings"
      group: "Shop Settings"
    }
    {
      label: "Dashboard Access"
      permission: "dashboard/settings/account"
      group: "Shop Settings"
    }
    {
      label: "Orders"
      permission: "dashboard/orders"
      group: "Shop Management"
    }
  ]
