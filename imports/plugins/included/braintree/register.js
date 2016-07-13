/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "BrainTree",
  icon: "fa fa-credit-card",
  name: "reaction-braintree", // usually same as meteor package
  autoEnable: false, // auto-enable in dashboard
  settings: // private package settings config (blackbox)
  {
    mode: false,
    merchant_id: "",
    public_key: "",
    private_key: ""
  },
  registry: [
    // all options except route and template
    // are used to describe the
    // dashboard "app card".
    {
      provides: "dashboard",
      label: "Braintree",
      description: "Braintree payments",
      icon: "fa fa-credit-card",
      priority: 2,
      container: "paymentMethod",
      template: "braintree",
      permissions: [
        {
          label: "Braintree Dashboard",
          permission: "dashboard/payments"
        }
      ]
    },

    {
      label: "Braintree Settings",
      route: "/dashboard/braintree",
      provides: "settings",
      container: "dashboard",
      template: "braintreeSettings"
    },
    // configures template for checkout
    // paymentMethod dynamic template
    {
      template: "braintreePaymentForm",
      provides: "paymentMethod"
    }
  ]
});
