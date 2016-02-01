ReactionCore.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  icon: "fa fa-building",
  autoEnable: true,
  settings: {
    name: "Inventory"
  },
  registry: [{
    provides: "dashboard",
    template: "inventoryDashboard",
    label: "Inventory",
    description: "Inventory utilities",
    icon: "fa fa-building",
    cycle: 3,
    group: "reaction-inventory",
    permissions: [{
      label: "Inventory",
      permission: "dashboard/inventory"
    }]
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreInventoryWorkflow",
    collection: "Inventory",
    theme: "default",
    enabled: true
  }]
});


// {
//   label: "Inventory Settings",
//   route: "dashboard/inventory",
//   provides: "settings",
//   group: "reaction-inventory",
//   template: "inventorySettings"
// }],
