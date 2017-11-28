import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Dashboard",
  name: "reaction-dashboard",
  icon: "fa fa-th",
  autoEnable: true,
  settings: {
    name: "Dashboard"
  },
  registry: [{
    provides: ["dashboard"],
    workflow: "coreDashboardWorkflow",
    name: "dashboardPackages",
    label: "Core",
    description: "Reaction core shop configuration",
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
    provides: ["shortcut"],
    label: "Dashboard",
    template: "dashboardPackages",
    icon: "icon-reaction-logo",
    priority: 0,
    permissions: [{
      label: "Dashboard",
      permission: "dashboard"
    }]
  }, {
    route: "/dashboard/shop/settings",
    template: "shopSettings",
    name: "shopSettings",
    label: "Shop Settings",
    icon: "fa fa-th",
    provides: ["settings"],
    container: "dashboard"
  }, {
    label: "Options",
    provides: ["shopSettings"],
    container: "dashboard",
    template: "optionsShopSettings",
    showForShopTypes: ["primary"]
  }],
  layout: [{
    layout: "coreLayout",
    workflow: "coreDashboardWorkflow",
    theme: "default",
    enabled: true,
    structure: {
      template: "dashboardPackages",
      layoutHeader: "NavBar",
      layoutFooter: "",
      notFound: "notFound",
      dashboardHeader: "dashboardHeader",
      dashboardControls: "dashboardControls",
      dashboardHeaderControls: "dashboardHeaderControls",
      adminControlsFooter: "adminControlsFooter"
    }
  }]
});
