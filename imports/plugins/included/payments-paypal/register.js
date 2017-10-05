import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "PayPal",
  name: "reaction-paypal",
  icon: "fa fa-paypal",
  autoEnable: true,
  settings: {
    expressAuthAndCapture: false,
    express: {
      enabled: false,
      support: [
        "Authorize",
        "Capture",
        "Refund"
      ]
    },
    payflow: {
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
      provides: ["paymentSettings"],
      name: "paypal/settings/express",
      icon: "fa fa-paypal",
      template: "paypalExpressSettings"
    }, {
      label: "PayPal PayFlow",
      provides: ["paymentSettings"],
      name: "paypal/settings/payflow",
      icon: "fa fa-cc-paypal",
      template: "paypalPayFlowSettings"
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
      provides: ["paymentMethod"],
      icon: "fa fa-paypal",
      priority: 1
    }, {
      template: "paypalPayflowForm",
      label: "Credit Card",
      name: "payment/method/payflow",
      provides: ["paymentMethod"],
      icon: "fa fa-cc-paypal"
    }
  ]
});
