/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "ExamplePayment",
  name: "example-paymentmethod",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
  settings: {
    "mode": "false",
    "example-paymentmethod": {
      enabled: false
    }
  },
  registry: [
    // Settings panel
    {
      label: "Example Payment", // this key (minus spaces) is used for translations
      provides: "paymentSettings",
      container: "dashboard",
      template: "exampleSettings"
    },

    // Payment form for checkout
    {
      template: "examplePaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-credit-card-alt"
    }
  ]
});
