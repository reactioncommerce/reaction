/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "BrainTree",
  icon: "fa fa-credit-card",
  autoEnable: true,
  name: "reaction-braintree", // usually same as meteor package
  settings: // private package settings config (blackbox)
  {
    "mode": false,
    "merchant_id": "",
    "public_key": "",
    "private_key": "",
    "reaction-braintree": {
      enabled: false,
      support: [
        "Authorize",
        "Capture",
        "Refund"
      ]
    }
  },
  registry: [
    {
      label: "Braintree",
      provides: ["paymentSettings"],
      container: "dashboard",
      template: "braintreeSettings"
    },
    // configures template for checkout
    // paymentMethod dynamic template
    {
      template: "braintreePaymentForm",
      provides: ["paymentMethod"],
      icon: "fa fa-credit-card"
    }
  ]
});
