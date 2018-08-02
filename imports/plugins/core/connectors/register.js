import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Connectors",
  name: "connectors",
  icon: "fa fa-cloud-upload",
  autoEnable: true,
  settings: {},
  registry: [
    {
      provides: "dashboard",
      label: "Connectors",
      description: "Update database in bulk",
      route: "/dashboard/connectors",
      icon: "fa fa-cloud-upload",
      container: "core",
      template: "dashboardConnector",
      name: "dashboardProductImporter",
      workflow: "connectorWorkflow",
      priority: 2,
      meta: {
        actionView: {
          dashboardSize: "md"
        }
      }
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
