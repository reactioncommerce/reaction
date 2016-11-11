/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Stripe",
  name: "reaction-stripe",
  icon: "fa fa-cc-stripe",
  settings: {
    mode: false,
    api_key: ""
  },
  registry: [
    // Settings panel
    {
      label: "Stripe",
      name: "payments/settings/stripe",
      provides: "paymentSettings",
      container: "dashboard",
      template: "stripeSettings"
    },

    // Payment form for checkout
    {
      template: "stripePaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-cc-stripe"
    }
  ]
});
