import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shipping",
  name: "reaction-shipping",
  icon: "fa fa-truck",
  autoEnable: true,
  settings: {
    name: "Flat Rate Service"
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
      workflow: "coreDashboardWorkflow",
      template: "shipping"
    },
    {
      template: "flatRateCheckoutShipping",
      provides: "shippingMethod"
    }
  ]
});
