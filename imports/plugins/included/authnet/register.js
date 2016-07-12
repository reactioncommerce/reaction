/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Authorize.net",
  name: "reaction-auth-net",
  icon: "fa fa-credit-card",
  autoEnable: false,
  settings: {
    api_id: "",
    transaction_key: "",
    mode: false
  },
  registry: [
    // Dashboard card
    {
      provides: "dashboard",
      label: "Authorize.net",
      // route: "dashboard/authnet",
      template: "authnetDashboard",
      description: "Authorize.net payments",
      icon: "fa fa-credit-card",
      priority: 2,
      container: "paymentMethod"
    },

    // Settings panel
    {
      provides: "settings",
      label: "Authorize.net Settings",
      route: "/dashboard/authnet/settings",
      container: "dashboard",
      template: "authnetSettings"
    },

    // Payment form for checkout
    {
      template: "authnetPaymentForm",
      provides: "paymentMethod"
    }
  ]
});
