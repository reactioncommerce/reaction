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
    workflow: "coreDashboardWorkflow",
    template: "dashboardPackages",
    label: "Dashboard",
    description: "Reaction Core configuration",
    icon: "fa fa-th",
    priority: 0,
    container: "core",
    permissions: [{
      label: "Dashboard",
      permission: "dashboard"
    }]
  }, {
    route: "/dashboard",
    name: "dashboard",
    workflow: "coreDashboardWorkflow",
    provides: "shortcut",
    label: "Dashboard",
    template: "dashboardPackages",
    icon: "fa fa-th",
    priority: 0
  }, {
    route: "/dashboard/settings",
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
  }]
});
