/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "ExamplePayment",
  name: "example-paymentmethod",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
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
      template: "examplePaymentForm",
      provides: ["paymentMethod"],
      icon: "fa fa-credit-card-alt"
    }
  ],
  layout: [{
      state: "approved",
      template: "InvoiceActionsApproved",
      workflow: "paymentMethod"
  }],
  stateflows: [{
    name: "example-paymentmethod", // same as in paymentSettingsKey
    workflow: "paymentMethod",
    collection: "Orders",
    querySelector: "{ \"_id\": \"${this.docId}\", \"billing.shopId\": \"${this.shopId}\"}",
    locationPath: "billing.$.paymentMethod.workflow",
    // TODO: Strategy should be a dedicated strategy for credit card workflows,
    // that does know how to implement pushNextState(transition) appropriately
    strategy: "StateflowSimpleStrategy",
    fsm: {
      init: "created",
      transitions: [
        { name: "approvePayment", from: "created", to: "approved" },
        //  { name: 'captureError',  from: 'approved',  to: 'error' }, TODO: error branch
        { name: "capturePayment", from: "approved", to: "completed" }
      ]
    }
  }]
});
