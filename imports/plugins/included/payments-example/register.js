/* eslint camelcase: 0 */
import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";
import exampleCapturePayment from "./server/no-meteor/util/exampleCapturePayment";
import exampleCreateRefund from "./server/no-meteor/util/exampleCreateRefund";
import exampleListRefund from "./server/no-meteor/util/exampleListRefund";

Reaction.registerPackage({
  label: "ExamplePayment",
  name: "example-paymentmethod",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
  functionsByType: {
    exampleCapturePayment: [exampleCapturePayment],
    exampleCreateRefund: [exampleCreateRefund],
    exampleListRefund: [exampleListRefund]
  },
  graphQL: {
    resolvers,
    schemas
  },
  paymentMethods: [{
    name: "iou_example",
    displayName: "IOU Example"
  }],
  settings: {
    "mode": false,
    "apiKey": "",
    "example": {
      enabled: false
    },
    "example-paymentmethod": {
      enabled: false,
      support: [
        "Authorize",
        "Capture",
        "Refund"
      ]
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
