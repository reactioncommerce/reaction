import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "PayPal",
  name: "reaction-paypal",
  icon: "fa fa-paypal",
  autoEnable: false,
  registry: [{
    provides: "dashboard",
    label: "PayPal",
    description: "PayPal payments",
    icon: "fa fa-paypal",
    priority: 3,
    container: "paymentMethod",
    permissions: [{
      label: "PayPal",
      permission: "dashboard/payments"
    }]
  }, {
    label: "PayPal Settings",
    route: "/dashboard/paypal",
    provides: "settings",
    container: "reaction-paypal",
    template: "paypalSettings"
  }, {
    route: "/paypal/done",
    name: "paypalDone",
    template: "paypalDone",
    workflow: "coreWorkflow"
  }, {
    route: "/paypal/cancel",
    name: "paypalCancel",
    template: "paypalCancel",
    workflow: "coreWorkflow"
  }, {
    template: "paypalPaymentForm",
    provides: "paymentMethod"
  }]
});
