import exampleCapturePayment from "./util/exampleCapturePayment";
import exampleCreateAuthorizedPayment from "./util/exampleCreateAuthorizedPayment";
import exampleCreateRefund from "./util/exampleCreateRefund";
import exampleListRefunds from "./util/exampleListRefunds";
import schemas from "./schemas";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "ExamplePayment",
    name: "example-paymentmethod",
    icon: "fa fa-credit-card-alt",
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
        label: "Example Payment", // this key (minus spaces) is used for translations
        provides: ["paymentSettings"],
        container: "dashboard",
        template: "exampleSettings"
      }
    ]
  });
}
