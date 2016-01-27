ReactionCore.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  icon: "fa fa-truck",
  autoEnable: true,
  settings: {
    name: "Inventory"
  },
  registry: [{
    provides: "dashboard",
    // route: "dashboard/inventory",
    label: "Inventory",
    description: "Basic Inventory Management",
    i18nKeyLabel: "admin.dashboard.inventoryLabel",
    i18nKeyDescription: "admin.dashboard.inventoryDescription",
    icon: "fa fa-building",
    cycle: 1,
    group: "reaction-inventory"
  }, {
    label: "Inventory Settings",
    i18nKeyLabel: "admin.settings.inventory",
    route: "dashboard/inventory",
    provides: "settings",
    group: "reaction-inventory",
    template: "inventorySettings"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreInventoryWorkflow",
    collection: "Inventory",
    theme: "default",
    enabled: true
  }]
});
