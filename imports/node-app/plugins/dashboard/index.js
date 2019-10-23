import i18n from "./i18n/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Dashboard",
    name: "reaction-dashboard",
    i18n,
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
}
