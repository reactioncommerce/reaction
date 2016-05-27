ReactionCore.registerPackage({
  label: "Shipping",
  name: "reaction-shipping",
  icon: "fa fa-truck",
  autoEnable: true,
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
