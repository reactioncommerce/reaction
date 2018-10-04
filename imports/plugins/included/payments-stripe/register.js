/* eslint camelcase: 0 */
import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Stripe",
  name: "reaction-stripe",
  icon: "fa fa-cc-stripe",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  paymentMethods: [ {
    name: 'stripe',
    displayName: 'Stripe'
  } ],
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
      publishable_key: "",
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
