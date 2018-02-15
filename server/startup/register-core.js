import { Reaction } from "/server/api";

/*
 * register reaction core components as reaction packages
 */
export default function () {
  Reaction.registerPackage({
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
        host: "",
        port: ""
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
        layoutHeader: "NavBar",
        layoutFooter: "Footer",
        notFound: "productNotFound",
        dashboardControls: "dashboardControls",
        adminControlsFooter: "adminControlsFooter"
      }
    }, {
      layout: "coreLayout",
      workflow: "coreWorkflow",
      theme: "default",
      enabled: true,
      structure: {
        template: "unauthorized",
        layoutHeader: "NavBar",
        layoutFooter: "Footer"
      }
    }]
  });
}
