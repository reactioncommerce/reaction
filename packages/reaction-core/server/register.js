/*
* register reaction core components as reaction packages
*/

ReactionCore.registerPackage = function(packageInfo) {
  var registeredPackage = ReactionRegistry.Packages[packageInfo.name] = packageInfo;
  return registeredPackage;
};

ReactionCore.registerPackage({
  name: 'core',
  autoEnable: true,
  settings: {
    "public": {
      allowGuestCheckout: true
    },
    mail: {
      user: "",
      password: "",
      host: "localhost",
      port: "25"
    }
  },
  registry: [
    {
      route: "dashboard/settings/shop",
      provides: 'dashboard',
      label: 'Core',
      description: 'Reaction Commerce Core',
      icon: 'fa fa-th',
      cycle: 1,
      container: "dashboard",
      permissions: [
        {
          label: "Dashboard",
          permission: "dashboard"
        }
      ]
    }, {
      route: "dashboard",
      provides: 'shortcut',
      label: 'Dashboard',
      icon: 'fa fa-th',
      cycle: 1
    }, {
      route: "dashboard",
      label: 'Dashboard',
      provides: 'console',
      permissions: [
        {
          label: "Console",
          permission: "console"
        }
      ]
    }, {
      route: "dashboard/settings/shop",
      label: "Shop Settings",
      i18nLabel: "app.shopSettings",
      provides: 'settings',
      icon: "fa fa-cog fa-2x fa-fw",
      container: 'dashboard'
    }, {
      route: "dashboard/orders",
      provides: 'dashboard',
      label: 'Orders',
      description: 'Fulfill your orders',
      icon: 'fa fa-sun-o',
      cycle: 3,
      container: "orders"
    }, {
      route: "dashboard/orders",
      provides: 'shortcut',
      label: 'Orders',
      description: 'Fulfill your orders',
      icon: 'fa fa-sun-o',
      cycle: 3
    }, {
      route: "dashboard/orders",
      label: 'Orders',
      provides: 'console'
    }, {
      template: "coreOrderWidgets",
      provides: 'widget',
      route: "dashboard/orders"
    }, {
      route: 'createProduct',
      label: 'Add Product',
      icon: 'fa fa-plus',
      provides: 'shortcut'
    }, {
      route: 'dashboard/members',
      label: 'Members',
      description: 'Manage your user accounts',
      icon: 'fa fa-users',
      provides: 'dashboard',
      cycle: 3
    }, {
      route: 'dashboard/members',
      label: 'Members',
      provides: 'console'
    }, {
      route: "dashboard/members",
      provides: 'shortcut',
      label: 'Members',
      icon: 'fa fa-users',
      cycle: 1
    }, {
      route: 'account/profile',
      label: 'Profile',
      icon: 'fa fa-user',
      provides: 'userAccountDropdown'
    }
  ]
});
