import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "PayPal",
  name: "reaction-payflow-pro",
  icon: "fa fa-paypal",
  autoEnable: true,
  settings: {
    "reaction-payflow-pro": {
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
      label: "PayPal PayFlow",
      provides: "paymentSettings",
      name: "paypal/settings/payflow",
      icon: "fa fa-cc-paypal",
      template: "paypalPayFlowSettings"
    },{
      template: "paypalPayflowForm",
      label: "Credit Card",
      name: "payment/method/payflow",
      provides: "paymentMethod",
      icon: "fa fa-cc-paypal"
    }
  ]
});
