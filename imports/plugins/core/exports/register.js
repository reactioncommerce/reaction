import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Exports",
  name: "reaction-exports",
  icon: "fa fa-downlaod",
  autoEnable: true,
  settings: {
    export: {
      enabled: true
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      name: "exports",
      label: "Exports",
      description: "Export Orders",
      icon: "fa fa-download",
      priority: 2,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "Export Settings",
      icon: "fa fa-download",
      name: "export/settings",
      provides: ["settings"],
      template: "exportSettings"
    }
  ]
});
