import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shipping",
  name: "reaction-shipping",
  icon: "fa fa-truck",
  autoEnable: true,
  settings: {
    name: "Shipping",
    shipping: {
      enabled: true
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      route: "/dashboard/shipping",
      name: "shipping",
      label: "Shipping",
      description: "Shipping dashboard",
      icon: "fa fa-truck",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      provides: ["settings"],
      name: "settings/shipping",
      label: "Shipping",
      description: "Configure shipping",
      icon: "fa fa-truck",
      template: "shippingSettings"
    }
  ]
});
