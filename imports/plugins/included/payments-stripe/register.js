/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Stripe",
  name: "reaction-stripe",
  icon: "fa fa-cc-stripe",
  autoEnable: true,
  settings: {
    "mode": false,
    "api_key": "",
    "reaction-stripe": {
      enabled: false,
      support: [
        "Authorize",
        "Capture",
        "Refund"
      ]
    },
    "public": {
      client_id: ""
    },
    "connectAuth": {}
  },
  registry: [
    // Settings panel
    {
      label: "Stripe",
      provides: ["paymentSettings"],
      container: "dashboard",
      template: "stripeSettings",
      hideForShopTypes: ["merchant", "affiliate"]
    },

    // Payment form for checkout
    {
      template: "stripePaymentForm",
      provides: ["paymentMethod", "marketplacePaymentMethod"],
      icon: "fa fa-cc-stripe"
    },

    // Redirect for Stripe Connect Sign-In
    {
      route: "/stripe/connect/authorize",
      template: "stripeConnectAuthorize"
    },

    // Payment Signup for Merchants
    {
      label: "Stripe Merchant Account",
      icon: "fa fa-cc-stripe",
      container: "dashboard",
      provides: ["marketplaceMerchantSettings"],
      template: "stripeConnectMerchantSignup",
      hideForShopTypes: ["primary"]
    }
  ]
});
