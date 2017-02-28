import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Email",
  name: "reaction-email",
  icon: "fa fa-envelope-o",
  autoEnable: true,
  settings: {
    name: "Email"
  },
  registry: [{
    label: "Email Settings",
    description: "Email settings",
    icon: "fa fa-envelope-o",
    name: "email/settings",
    provides: "settings",
    workflow: "coreEmailWorkflow",
    template: "emailSettings"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreEmailWorkflow",
    theme: "default",
    enabled: true,
    structure: {
      template: "email",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
