/* eslint camelcase: 0 */
import schemas from "./schemas";
import stripeCapturePayment from "./util/stripeCapturePayment";
import stripeCreateAuthorizedPayment from "./util/stripeCreateAuthorizedPayment";
import stripeCreateRefund from "./util/stripeCreateRefund";
import stripeListRefunds from "./util/stripeListRefunds";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Stripe",
    name: "reaction-stripe",
    icon: "fa fa-cc-stripe",
    graphQL: {
      schemas
    },
    paymentMethods: [{
      name: "stripe_card",
      canRefund: true,
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
}
