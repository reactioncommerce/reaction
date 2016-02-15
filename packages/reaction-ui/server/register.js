ReactionCore.registerPackage({
  label: "UI",
  name: "reaction-ui",
  icon: "fa fa-html5",
  autoEnable: true,
  settings: "",
  registry: [{
    route: "/dashboard/ui",
    name: "reaction-ui/uiDashboard",
    provides: "dashboard",
    container: "appearance",
    label: "UI",
    description: "Themes and UI Components",
    icon: "fa fa-html5",
    priority: 1,
    template: "uiDashboard"
  }, {
    route: "/dashboard/ui/:id",
    name: "dashboard/uiThemeDetails",
    template: "uiThemeDetails"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreAccountsWorkflow",
    collection: "Themes",
    theme: "default",
    enabled: true,
    structure: {
      template: "accountsDashboard",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "accountsDashboardControls",
      dashboardHeaderControls: "",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});

ReactionUI.registerTheme(Assets.getText("private/themes/button.css"));
