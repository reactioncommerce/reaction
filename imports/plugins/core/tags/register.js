import Reaction from "/imports/plugins/core/core/server/Reaction";
import mutations from "./server/no-meteor/mutations";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";
// import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Tags",
  name: "reaction-tags",
  icon: "fa fa-tag",
  autoEnable: true,
  graphQL: {
    resolvers,
    schemas
  },
  mutations,
  // functionsByType: {
  //   startup: [startup]
  // },
  registry: [{
    label: "Tags",
    description: "Tag Management",
    icon: "fa fa-tag",
    name: "tag/settings",
    provides: ["settings"],
    workflow: "coreTagWorkflow",
    template: "tagSettings",
    meta: {
      actionView: {
        dashboardSize: "md"
      }
    }
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreTagWorkflow",
    theme: "default",
    enabled: true,
    structure: {
      template: "tagSettings",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
