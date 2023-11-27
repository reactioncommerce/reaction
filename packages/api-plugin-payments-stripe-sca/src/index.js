import pkg from "../package.json" assert { type: "json" };
import { STRIPE_PACKAGE_NAME } from "./util/constants.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import mutations from "./mutations/index.js";

import stripeCapturePayment from "./util/stripeCapturePayment.js";
import stripeCreateAuthorizedPayment from "./util/stripeCreateAuthorizedPayment.js";
import stripeCreateRefund from "./util/stripeCreateRefund.js";
import stripeListRefunds from "./util/stripeListRefunds.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Stripe SCA Payments",
    name: STRIPE_PACKAGE_NAME,
    version: pkg.version,
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    paymentMethods: [
      {
        name: "stripe_payment_intent",
        canRefund: true,
        displayName: "Stripe (SCA)",
        functions: {
          capturePayment: stripeCapturePayment,
          createAuthorizedPayment: stripeCreateAuthorizedPayment,
          createRefund: stripeCreateRefund,
          listRefunds: stripeListRefunds
        }
      }
    ]
  });
}
