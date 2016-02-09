/*
 * register reaction core components as reaction packages
 */

ReactionCore.registerPackage = function (packageInfo) {
  let registeredPackage = ReactionRegistry.Packages[packageInfo.name] =
    packageInfo;
  return registeredPackage;
};

ReactionCore.registerPackage({
  label: "Core",
  name: "core",
  icon: "fa fa-th",
  autoEnable: true,
  settings: {
    public: {
      allowGuestCheckout: true
    },
    mail: {
      user: "",
      password: "",
      host: "localhost",
      port: "25"
    },
    openexchangerates: {
      appId: "",
      refreshPeriod: "every 1 hour"
    },
    paymentMethod: {
      defaultPaymentMethod: ""
    }
  },
  registry: [{
    provides: "dashboard",
    label: "Core",
    description: "Reaction Core configuration",
    icon: "fa fa-th",
    cycle: 0,
    container: "dashboard",
    permissions: [{
      label: "Dashboard",
      permission: "dashboard"
    }]
  }, {
    route: "dashboard",
    provides: "shortcut",
    label: "Dashboard",
    icon: "fa fa-th",
    cycle: 0
  }, {
    route: "dashboard/shop",
    template: "shopSettings",
    label: "Shop Settings",
    provides: "settings",
    container: "dashboard"
  }, {
    route: "createProduct",
    label: "Add Product",
    icon: "fa fa-plus",
    provides: "shortcut"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreWorkflow",
    theme: "default",
    enabled: true,
    structure: {
      template: "products",
      layoutHeader: "layoutHeader",
      layoutFooter: "layoutFooter",
      notFound: "productNotFound",
      dashboardControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
