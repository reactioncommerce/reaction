ReactionCore.registerPackage({
  label: "UI",
  name: "reaction-ui",
  icon: "fa fa-html5",
  autoEnable: true,
  settings: "",
  registry: [{
    provides: "dashboard",
    container: "appearance",
    route: "dashboard/ui",
    label: "UI",
    description: "Themes and UI Components",
    icon: "fa fa-html5",
    priority: 1,
    group: "core",
    template: "uiDashboard"
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
