import {Reaction} from "/server/api";

Reaction.registerPackage({
  label: "PayPal",
  name: "reaction-paypal",
  icon: "fa fa-paypal",
  settings: {
    "reaction-paypal": {
      enabled: false
    }
  },
  registry: [
    {
      label: "PayPal",
      provides: "paymentSettings",
      container: "reaction-paypal",
      icon: "fa fa-paypal",
      template: "paypalSettings"
    }, {
      route: "/paypal/done",
      template: "paypalDone",
      workflow: "coreWorkflow"
    }, {
      route: "/paypal/cancel",
      template: "paypalCancel",
      workflow: "coreWorkflow"
    }, {
      template: "paypalPaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-paypal"
    }
  ]
});
