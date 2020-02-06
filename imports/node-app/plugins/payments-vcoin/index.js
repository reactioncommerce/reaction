import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import exampleCapturePayment from "./util/exampleCapturePayment.js";
import exampleCreateAuthorizedPayment from "./util/exampleCreateAuthorizedPayment.js";
import exampleCreateRefund from "./util/exampleCreateRefund.js";
import exampleListRefunds from "./util/exampleListRefunds.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "VCoinPayment",
    name: "vcoin-paymentmethod",
    i18n,
    graphQL: {
      schemas
    },
    functionsByType: {
      startup: [startup]
    },
    paymentMethods: [{
      name: "vcoin_example",
      canRefund: true,
      displayName: "Vcoin Example",
      functions: {
        capturePayment: exampleCapturePayment,
        createAuthorizedPayment: exampleCreateAuthorizedPayment,
        createRefund: exampleCreateRefund,
        listRefunds: exampleListRefunds
      }
    }],
    settings: {
      mode: false,
      apiKey: "",
      example: {
        enabled: false
      }
    },
    registry: [
      // Settings panel
      {
        label: "VCoin Payment", // this key (minus spaces) is used for translations
        provides: ["paymentSettings"],
        container: "dashboard",
        template: "vcoinSettings"
      }
    ]
  });
}
