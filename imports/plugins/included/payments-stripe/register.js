/* eslint camelcase: 0 */
import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";
import stripeCapturePayment from "./server/no-meteor/util/stripeCapturePayment";
import stripeCreateRefund from "./server/no-meteor/util/stripeCreateRefund";
import stripeListRefunds from "./server/no-meteor/util/stripeListRefunds";

Reaction.registerPackage({
  label: "Stripe",
  name: "reaction-stripe",
  icon: "fa fa-cc-stripe",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  paymentMethods: [{
    name: "stripe_card",
    displayName: "Stripe Card",
    functions: {
      capturePayment: stripeCapturePayment,
      createRefund: stripeCreateRefund,
      listRefunds: stripeListRefunds
    }
  }],
  settings: {
    mode: false,
    api_key: "",
    support: [
      "Authorize",
      "Capture",
      "Refund"
    ],
    public: {
      publishable_key: "",
      client_id: ""
    },
    connectAuth: {}
  },
  registry: [
    // Settings panel
    {
      label: "Stripe",
      provides: ["paymentSettings"],
      container: "dashboard",
      template: "stripeSettings"
    },

    // Payment form for checkout
    {
      template: "stripePaymentForm",
      provides: ["paymentMethod"],
      icon: "fa fa-cc-stripe"
    }
  ]
});
