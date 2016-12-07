import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Email",
  name: "reaction-templates",
  icon: "fa fa-columns",
  autoEnable: true,
  settings: {
    name: "Templates"
  },
  registry: [{
    route: "/dashboard/templates",
    provides: "dashboard",
    workflow: "coreEmailWorkflow",
    name: "Templates",
    label: "Templates",
    description: "App Templates",
    icon: "fa fa-columns",
    priority: 1,
    container: "appearance",
    template: "emailTemplatesDashboard"
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
      // dashboardHeaderControls: "emailDashboardTabs", // removed until needed for nav tabs
      dashboardControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
