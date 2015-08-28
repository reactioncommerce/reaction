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
  ],
  layout: [
    {
      template: "checkoutLogin",
      label: "Account",
      workflow: 'coreCartWorkflow',
      container: 'checkout-steps-main',
      audience: ["guest", "anonymous"],
      priority: 1,
      position: "1"
    },
    {
      template: "checkoutAddressBook",
      label: "Address Details",
      workflow: 'coreCartWorkflow',
      container: 'checkout-steps-main',
      audience: ["guest", "anonymous"],
      priority: 2,
      position: "2"
    },
    {
      template: "coreCheckoutShipping",
      label: "Shipping Options",
      workflow: 'coreCartWorkflow',
      container: 'checkout-steps-main',
      audience: ["guest", "anonymous"],
      priority: 3,
      position: "3"
    },
    {
      template: "checkoutReview",
      label: "Review",
      workflow: 'coreCartWorkflow',
      container: 'checkout-steps-side',
      audience: ["guest", "anonymous"],
      priority: 4,
      position: "4"
    },
    {
      template: "checkoutPayment",
      label: "Complete",
      workflow: 'coreCartWorkflow',
      container: 'checkout-steps-side',
      audience: ["guest", "anonymous"],
      priority: 5,
      position: "5"
    },
    {
      template: "orderCreated",
      label: "Created",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"],
      priority: 1,
      position: ""
    },
    {
      template: "shipmentTracking",
      label: "Tracking",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"]
    },
    {
      template: "shipmentPrepare",
      label: "Preparation",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"]
    },
    {
      template: "processPayment",
      label: "Process Payments",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"]
    },
    {
      template: "shipmentShipped",
      label: "Shipped",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"]
    },
    {
      template: "orderCompleted",
      label: "Completed",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"]
    },
    {
      template: "orderAdjustments",
      label: "Adjusted",
      workflow: 'coreOrderWorkflow',
      audience: ["guest", "anonymous"]
    }
  ]
});
