/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Authorize.net",
  name: "reaction-auth-net",
  icon: "fa fa-credit-card",
  settings: {
    api_id: "",
    transaction_key: "",
    mode: false
  },
  registry: [
    // Settings panel
    {
      provides: "paymentSettings",
      label: "Authorize.net",
      name: "payments/settings/authnet",
      container: "dashboard",
      template: "authnetSettings"
    },

    // Payment form for checkout
    {
      template: "authnetPaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-credit-card"
    }
  ]
});
