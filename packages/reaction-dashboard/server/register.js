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
    label: "Core",
    description: "Reaction Core configuration",
    icon: "fa fa-th",
    priority: 0,
    container: "dashboard",
    permissions: [{
      label: "Dashboard",
      permission: "dashboard"
    }]
  }, {
    route: "dashboard",
    workflow: "coreDashboardWorkflow",
    provides: "shortcut",
    label: "Dashboard",
    icon: "fa fa-th",
    priority: 0
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
  }]
});

//
// define dashboard group
//
//
// dashboard = ReactionRouter.group({
//   prefix: "/dashboard"
// });
//
// //
// // dashboard home
// //
//
// dashboard.route("/", {
//   name: "dashboard",
//   action: () => {
//     // not sure the behavior this is trying to resolve
//     $(document).trigger("closeAllPopovers");
//
//     // initialize reaction layout
//     let dashboardLayout =  {
//       workflow: "coreDashboardWorkflow"
//     };
//     // initialize reaction layout
//     renderLayout(dashboardLayout);
//   }
// });
//
// //
// // dashboard accounts
// //
// dashboard.route("/accounts", {
//   name: "dashboard/accounts",
//   action: function () {
//     let dashboardLayout =  {
//       workflow: "coreAccountsWorkflow"
//     };
//     // initialize reaction layout
//     renderLayout(dashboardLayout);
//   }
// });
