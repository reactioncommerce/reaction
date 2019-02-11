import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import queries from "./server/no-meteor/queries";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Navigation",
  name: "navigation",
  autoEnable: true,
  graphQL: {
    schemas,
    resolvers
  },
  mutations,
  queries,
  registry: [
    {
      provides: ["settings"],
      label: "Navigation",
      description: "Manage navigation",
      route: "/dashboard/navigation",
      icon: "fa fa-bars",
      container: "core",
      template: "navigationDashboard",
      name: "navigation-dashboard",
      workflow: "navigationWorkflow",
      priority: 2,
      meta: {
        actionView: {
          dashboardSize: "lg"
        }
      }
    }
  ],
  layout: [{
    workflow: "navigationWorkflow",
    layout: "coreLayout",
    theme: "default",
    enabled: true,
    structure: {
      template: "navigationDashboard",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "notFound",
      dashboardControls: "",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
