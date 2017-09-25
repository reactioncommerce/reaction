import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Inventory",
  name: "reaction-inventory",
  icon: "fa fa-building",
  autoEnable: true,
  settings: {
    name: "Inventory"
  },
  registry: [{
    provides: ["dashboard"],
    label: "Inventory",
    description: "Inventory utilities",
    icon: "fa fa-building",
    priority: 1,
    container: "utilities",
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
