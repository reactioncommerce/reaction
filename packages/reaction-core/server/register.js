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
  }, {
    layout: "coreLayout",
    workflow: "coreUnauthorized",
    theme: "default",
    enabled: true,
    structure: {
      template: "unauthorized",
      layoutHeader: "layoutHeader",
      layoutFooter: "layoutFooter"
    }
  }]
});
