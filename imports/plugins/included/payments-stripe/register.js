/* eslint camelcase: 0 */
import Reaction from "/imports/plugins/core/core/server/Reaction";
import schemas from "./server/no-meteor/schemas";
import stripeCapturePayment from "./server/no-meteor/util/stripeCapturePayment";
import stripeCreateAuthorizedPayment from "./server/no-meteor/util/stripeCreateAuthorizedPayment";
import stripeCreateRefund from "./server/no-meteor/util/stripeCreateRefund";
import stripeListRefunds from "./server/no-meteor/util/stripeListRefunds";

Reaction.registerPackage({
  label: "Stripe",
  name: "reaction-stripe",
  icon: "fa fa-cc-stripe",
  autoEnable: true,
  graphQL: {
    schemas
  },
  paymentMethods: [{
    name: "stripe_card",
    displayName: "Stripe Card",
    functions: {
      capturePayment: stripeCapturePayment,
      createAuthorizedPayment: stripeCreateAuthorizedPayment,
      createRefund: stripeCreateRefund,
      listRefunds: stripeListRefunds
    }
  }],
  settings: {
    mode: false,
    api_key: "",
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
    }
  ]
});
