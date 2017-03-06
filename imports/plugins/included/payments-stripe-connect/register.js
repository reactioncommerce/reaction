/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Stripe Connect",
  name: "reaction-stripe-connect",
  icon: "fa fa-cc-stripe",
  autoEnable: true,
  settings: {
    "mode": false,
    "api_key": "",
    "reaction-stripe-connect": {
      enabled: false
    },
    "stripe-redirect-url": "stripe-connect-redirect",
    "transactionFee": {
      enabled: false,
      percentage: 0
    }
  },
  registry: [
    // Settings panel
    {
      label: "Stripe Connect",
      provides: "paymentSettings",
      container: "dashboard",
      template: "stripeConnectSettings"
    },

    // Payment form for checkout
    {
      template: "stripePaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-cc-stripe"
    },

    // Redirect for Stripe Connect Sign-In
    {
      template: "stripeConnectRedirect",
      route: "/stripe-connect-redirect"
    }
  ]
});
