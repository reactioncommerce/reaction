/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Stripe",
  name: "reaction-stripe",
  icon: "fa fa-cc-stripe",
  autoEnable: false,
  settings: {
    mode: false,
    api_key: ""
  },
  registry: [
    // Dashboard card
    {
      provides: "dashboard",
      label: "Stripe",
      description: "Stripe payments",
      icon: "fa fa-cc-stripe",
      priority: 2,
      container: "paymentMethod"
    },

    // Settings panel
    {
      label: "Stripe Settings",
      route: "/dashboard/stripe",
      provides: "settings",
      container: "dashboard",
      template: "stripeSettings"
    },

    // Payment form for checkout
    {
      template: "stripePaymentForm",
      provides: "paymentMethod"
    }
  ]
});
