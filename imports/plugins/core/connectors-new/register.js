import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "New Connector", // TODO: Rename
  name: "connectors-new", // TODO: Rename
  icon: "fa fa-cloud-upload", // TODO: Change
  autoEnable: true,
  settings: {},
  registry: [
    {
      provides: "dashboard",
      label: "Connectors",
      description: "Update database in bulk",
      route: "/dashboard/connectors",
      icon: "fa fa-cloud-upload", // TODO: Change
      container: "core",
      template: "dashboardConnector",
      name: "dashboardProductImporter",
      workflow: "connectorWorkflow",
      priority: 2
    }
  ],
  layout: [{
    workflow: "connectorWorkflow",
    layout: "coreLayout",
    theme: "default",
    enabled: true,
    structure: {
      template: "dashboardConnector",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "notFound",
      dashboardControls: "",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
