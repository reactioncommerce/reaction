ReactionCore.registerPackage({
  label: "Dashboard",
  name: "reaction-dashboard",
  icon: "fa fa-th",
  autoEnable: true,
  settings: {
    name: "Dashboard"
  },
  registry: [{
    provides: "dashboard",
    label: "Core",
    description: "Reaction Core configuration",
    icon: "fa fa-th",
    cycle: 0,
    container: "dashboard",
    permissions: [{
      label: "Dashboard",
      permission: "dashboard"
    }]
  }, {
    route: "dashboard",
    provides: "shortcut",
    label: "Dashboard",
    icon: "fa fa-th",
    cycle: 0
  }, {
    route: "dashboard/shop",
    template: "shopSettings",
    label: "Shop Settings",
    provides: "settings",
    container: "dashboard"
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreDashboardWorkflow",
    theme: "default",
    enabled: true,
    structure: {
      template: "dashboardPackages",
      layoutHeader: "layoutHeader",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "dashboardControls",
      dashboardHeaderControls: "dashboardHeaderControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }],
  permissions: [{
    label: "Dashboard",
    permission: "dashboard",
    group: "Shop Settings"
  }]
});
