import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shippo",
  name: "reaction-shippo",
  icon: "fa fa-at",
  autoEnable: true,
  settings: {
    name: "Shippo",
    "reaction-shippo": {
      enabled: false
    }
  },
  registry: [{
    provides: "dashboard",
    label: "Shippo",
    description: "Shippo service",
    icon: "fa fa-at",
    priority: 3,
    container: "connect",
    permissions: [{
      label: "Shippo",
      permission: "dashboard/shippo"
    }]
  }, {
    label: "Shippo",
    route: "/dashboard/shippo",
    provides: "settings",
    container: "connection",
    template: "shippoSettings"
  }
  // , {
  //   route: "/paypal/done",
  //   name: "paypalDone",
  //   template: "paypalDone",
  //   workflow: "coreWorkflow"
  // }, {
  //   route: "/paypal/cancel",
  //   name: "paypalCancel",
  //   template: "paypalCancel",
  //   workflow: "coreWorkflow"
  // }, {
  //   template: "paypalPaymentForm",
  //   provides: "paymentMethod"
  // }
  ]
});
