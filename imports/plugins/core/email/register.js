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
    route: "/dashboard/email/status",
    provides: "dashboard",
    workflow: "coreEmailWorkflow",
    name: "Email Status",
    label: "Email",
    description: "Email settings",
    icon: "fa fa-envelope-o",
    priority: 1,
    container: "core",
    template: "emailStatusPage"
  }, {
    label: "Email Settings",
    name: "email/settings",
    provides: "settings",
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
      // dashboardHeaderControls: "emailDashboardTabs", // removed until needed for nav
      dashboardControls: "dashboardControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
