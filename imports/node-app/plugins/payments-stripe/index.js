/* eslint camelcase: 0 */
import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import { STRIPE_PACKAGE_NAME } from "./util/constants.js";
import stripeCapturePayment from "./util/stripeCapturePayment.js";
import stripeCreateAuthorizedPayment from "./util/stripeCreateAuthorizedPayment.js";
import stripeCreateRefund from "./util/stripeCreateRefund.js";
import stripeListRefunds from "./util/stripeListRefunds.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Stripe",
    name: STRIPE_PACKAGE_NAME,
    i18n,
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
