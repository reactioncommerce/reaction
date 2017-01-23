import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shipping",
  name: "reaction-shipping",
  icon: "fa fa-truck",
  autoEnable: true,
  settings: {
    name: "Flat Rate Service",
    shipping: {
      enabled: true
    },
    flatRates: {
      enabled: true
    }
  },
  registry: [
    {
      provides: "dashboard",
      route: "/dashboard/shipping",
      name: "shipping",
      label: "Shipping",
      description: "Provide shipping rates",
      icon: "fa fa-truck",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      provides: "settings",
      name: "settings/shipping",
      label: "Shipping",
      description: "Provide shipping rates",
      icon: "fa fa-truck",
      template: "shipping"
    },
    {
      template: "flatRateCheckoutShipping",
      name: "shipping/flatRates",
      provides: "shippingMethod"
    }
  ]
});
