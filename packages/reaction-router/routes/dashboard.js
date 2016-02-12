//
// define dashboard group
//

dashboard = ReactionRouter.group({
  prefix: "/dashboard"
});

//
// dashboard home
//

dashboard.route("/", {
  name: "dashboard",
  action: () => {
    // initialize reaction layout
    let dashboardLayout =  {
      workflow: "coreDashboardWorkflow"
    };
    // initialize reaction layout
    renderLayout(dashboardLayout);
  }
});

//
// dashboard accounts
//
dashboard.route("/accounts", {
  name: "dashboard/accounts",
  action: function () {
    let dashboardLayout =  {
      workflow: "coreAccountsWorkflow"
    };
    // initialize reaction layout
    renderLayout(dashboardLayout);
  }
});

dashboard.route("/ui/:id", {
  name: "dashboard/uiThemeDetails",
  action: function () {
    let dashboardLayout =  {
      template: "uiThemeDetails"
    };
    // initialize reaction layout
    renderLayout(dashboardLayout);
  }
});
