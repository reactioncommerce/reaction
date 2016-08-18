/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "ExamplePayment",
  name: "example-paymentmethod",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
  settings: {
    mode: false,
    apiKey: ""
  },
  registry: [
    // Dashboard card
    {
      provides: "dashboard",
      label: "Example Payment Provider",
      description: "Example payment provider",
      icon: "fa fa-credit-card-alt",
      priority: 3,
      container: "paymentMethod"
    },

    // Settings panel
    {
      label: "Example Payment Settings", // this key (minus spaces) is used for translations
      route: "/dashboard/example",
      provides: "settings",
      container: "dashboard",
      template: "exampleSettings"
    },

    // Payment form for checkout
    {
      template: "examplePaymentForm",
      provides: "paymentMethod"
    }
  ]
});
