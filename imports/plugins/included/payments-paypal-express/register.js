import {Reaction} from "/server/api";

Reaction.registerPackage({
  label: "PayPal",
  name: "reaction-paypal-express",
  icon: "fa fa-paypal",
  autoEnable: true,
  settings: {
    "reaction-paypal-express": {
      enabled: false,
      support: [
        "Authorize",
        "Capture",
        "Refund"
      ]
    }
  },
  registry: [
    {
      label: "PayPal Express",
      provides: "paymentSettings",
      name: "paypal/settings/express",
      icon: "fa fa-paypal",
      template: "paypalExpressSettings"
    }, {
      route: "/paypal/done",
      template: "paypalDone",
      workflow: "coreWorkflow"
    }, {
      route: "/paypal/cancel",
      template: "paypalCancel",
      workflow: "coreWorkflow"
    }, {
      template: "paypalCheckoutButton",
      label: "Express",
      name: "payment/method/express",
      provides: "paymentMethod",
      icon: "fa fa-paypal",
      priority: 1
    }
  ]
});
