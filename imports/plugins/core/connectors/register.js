import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Connectors",
  name: "connectors",
  icon: "fa fa-exchange",
  autoEnable: true,
  settings: {},
  registry: [
    {
      provides: ["settings"],
      label: "Connectors",
      description: "Update database in bulk",
      route: "/dashboard/connectors",
      icon: "fa fa-exchange",
      container: "core",
      template: "connectorsDashboard",
      name: "connectors-dashboard",
      workflow: "connectorsWorkflow",
      priority: 2,
      meta: {
        actionView: {
          dashboardSize: "md"
        }
      }
    }
  ],
  layout: [{
    workflow: "connectorsWorkflow",
    layout: "coreLayout",
    theme: "default",
    enabled: true,
    structure: {
      template: "connectorsDashboard",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "notFound",
      dashboardControls: "",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
