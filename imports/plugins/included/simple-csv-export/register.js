import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Export-CSV",
  name: "reaction-simple-export-csv",
  icon: "fa fa-download",
  autoEnable: true,
  settings: {
    name: "Export to CSV"
  },
  registry: [{
    provides: ["dashboard"],
    label: "Export-CSV",
    description: "Export Orders to CSV",
    icon: "fa fa-download",
    priority: 3,
    container: "core",
    workflow: "coreDashboardWorkflow"
  }]
});
