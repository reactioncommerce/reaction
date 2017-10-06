import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Connectors",
  name: "reaction-connectors",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {
    name: "Connectors"
  },
  registry: [{
    provides: ["dashboard"],
    route: "/dashboard/connectors",
    name: "connectors",
    label: "Connectors",
    description: "Connectors dashboard",
    icon: "fa fa-exchange",
    priority: 1,
    container: "core",
    workflow: "coreDashboardWorkflow"
  }, {
    provides: ["settings"],
    name: "settings/connectors",
    label: "Connectors",
    description: "Configure connectors",
    icon: "fa fa-exchange",
    template: "connectorSettings"
  }]
});
