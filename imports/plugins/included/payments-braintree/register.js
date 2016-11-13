/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "BrainTree",
  icon: "fa fa-credit-card",
  name: "reaction-braintree", // usually same as meteor package
  settings: // private package settings config (blackbox)
  {
    mode: false,
    merchant_id: "",
    public_key: "",
    private_key: ""
  },
  registry: [
    {
      label: "Braintree",
      name: "payments/settings/braintree",
      provides: "paymentSettings",
      container: "dashboard",
      template: "braintreeSettings"
    },
    // configures template for checkout
    // paymentMethod dynamic template
    {
      template: "braintreePaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-credit-card"
    }
  ]
});
