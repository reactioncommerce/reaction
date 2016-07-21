import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "UI",
  name: "reaction-ui",
  icon: "fa fa-html5",
  autoEnable: true,
  settings: "",
  registry: [{
    route: "/dashboard/ui",
    name: "reaction-ui/uiDashboard",
    provides: "dashboard",
    workflow: "coreUIWorkflow",
    container: "appearance",
    label: "Themes",
    description: "Themes and UI Components",
    icon: "fa fa-html5",
    priority: 1,
    template: "uiDashboard"
  }, {
    route: "/dashboard/ui/:id",
    workflow: "coreUIWorkflow",
    name: "dashboard/uiThemeDetails",
    template: "uiThemeDetails"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreUIWorkflow",
    collection: "Themes",
    theme: "default",
    enabled: true,
    structure: {
      template: "uiDashboard",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
