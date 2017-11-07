/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Authorize.net",
  name: "reaction-auth-net",
  icon: "fa fa-credit-card",
  autoEnable: true,
  settings: {
    "api_id": "",
    "transaction_key": "",
    "mode": false,
    "authnet": {
      enabled: false
    },
    "reaction-auth-net": {
      enabled: false,
      support: [
        "Authorize",
        "Capture"
      ]
    }
  },
  registry: [
    // Settings panel
    {
      provides: ["paymentSettings"],
      label: "Authorize.net",
      container: "dashboard",
      template: "authnetSettings"
    },

    // Payment form for checkout
    {
      template: "authnetPaymentForm",
      provides: ["paymentMethod"],
      icon: "fa fa-credit-card"
    }
  ]
});
