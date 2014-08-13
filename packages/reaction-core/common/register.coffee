# Define register method
ReactionCore.registerPackage = (packageInfo) ->
  ReactionCore.Packages[packageInfo.name] = packageInfo

# for backwards-compatibility; remove once no reaction packages depend on it
Meteor.app.packages = {}
Meteor.app.packages.register = ReactionCore.registerPackage

# Register core packages
ReactionCore.registerPackage
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
  autoEnable: true
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

ReactionCore.registerPackage
  name: 'reaction-commerce-orders'
  provides: ['orderManager']
  label: 'Orders'
  overviewRoute: 'dashboard/orders'
  hasWidget: true
  hidden: true
  autoEnable: true
  shopPermissions: [
    {
      label: "Orders"
      permission: "dashboard/orders"
      group: "Shop Management"
    }
  ]

ReactionCore.registerPackage
  name: 'reaction-commerce-staff-accounts'
  provides: ['staffAccountsManager']
  label: 'Admin Access'
  settingsRoute: 'dashboard/settings/account'
  hidden: true
  autoEnable: true
  shopPermissions: [
    {
      label: "Dashboard Access"
      permission: "dashboard/settings/account"
      group: "Shop Settings"
    }
  ]

# On the server, we upsert all packages on startup
if Meteor.isServer
  Packages = ReactionCore.Collections.Packages
  Meteor.startup ->
    # Loop through ReactionCore.Packages object, which now has all packages added by
    # calls to register
    _.each ReactionCore.Packages, (config, pkgName) ->
      Shops.find().forEach (shop) ->
        Packages.upsert {shopId: shop._id, name: pkgName},
          $setOnInsert:
            enabled: !!config.autoEnable
            settings: config.defaultSettings
