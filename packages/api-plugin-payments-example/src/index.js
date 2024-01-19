import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import exampleCapturePayment from "./util/exampleCapturePayment.js";
import exampleCreateAuthorizedPayment from "./util/exampleCreateAuthorizedPayment.js";
import exampleCreateRefund from "./util/exampleCreateRefund.js";
import exampleListRefunds from "./util/exampleListRefunds.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Example Payments",
    name: "payments-example",
    version: pkg.version,
    i18n,
    graphQL: {
      schemas
    },
    functionsByType: {
      startup: [startup]
    },
    paymentMethods: [{
      name: "iou_example",
      canRefund: true,
      displayName: "IOU Example",
      functions: {
        capturePayment: exampleCapturePayment,
        createAuthorizedPayment: exampleCreateAuthorizedPayment,
        createRefund: exampleCreateRefund,
        listRefunds: exampleListRefunds
      }
    }]
  });
}
