import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "PayPal",
  name: "reaction-paypal",
  icon: "fa fa-paypal",
  registry: [{
    label: "PayPal",
    name: "payments/settings/paypal",
    provides: "paymentSettings",
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
    provides: "paymentMethod",
    icon: "fa fa-paypal"
  }]
});
