/* eslint camelcase: 0 */
import Reaction from "/imports/plugins/core/core/server/Reaction";
import schemas from "./server/no-meteor/schemas";
import exampleCapturePayment from "./server/no-meteor/util/exampleCapturePayment";
import exampleCreateAuthorizedPayment from "./server/no-meteor/util/exampleCreateAuthorizedPayment";
import exampleCreateRefund from "./server/no-meteor/util/exampleCreateRefund";
import exampleListRefunds from "./server/no-meteor/util/exampleListRefunds";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "ExamplePayment",
  name: "example-paymentmethod",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
  graphQL: {
    schemas
  },
  functionsByType: {
    startup: [startup]
  },
  paymentMethods: [{
    name: "iou_example",
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
    },

    // Payment form for checkout
    {
      template: "ExampleIOUPaymentForm",
      provides: ["paymentMethod"],
      icon: "fa fa-credit-card-alt"
    }
  ]
});
