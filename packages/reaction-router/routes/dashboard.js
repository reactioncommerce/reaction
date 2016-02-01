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
    // not sure the behavior this trying to resolve
    $(document).trigger("closeAllPopovers");

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



// //
// // dashboard package settings
// //
// dashboard.route("/:dashboard", {
//   action: function (params) {
//     let dashboardLayout =  {
//       worflow: "coreDashboardWorkflow",
//       template: params.dashboard
//     };
//     // initialize reaction layout
//     renderLayout(dashboardLayout);
//   }
// });

// this.route("dashboard", {
//   controller: ShopAdminController,
//   template: "dashboardPackages",
//   onBeforeAction: function () {
//     Session.set("dashboard", true);
//     return this.next();
//   }
// });
//
// this.route("dashboard/shop", {
//   controller: ShopAdminController,
//   path: "/dashboard/shop",
//   template: "shopDashboard",
//   data: function () {
//     return ReactionCore.Collections.Shops.findOne();
//   }
// });
//
// this.route("dashboard/import", {
//   controller: ShopAdminController,
//   path: "/dashboard/import",
//   template: "import"
// });
//
// this.route("dashboard/orders", {
//   controller: ShopAdminController,
//   path: "dashboard/orders/:_id?",
//   template: "orders",
//   onAfterAction: function () {
//     if (ReactionCore.hasDashboardAccess() && this.params._id) {
//       // this.layout("coreAdminLayout");
//       // Find a registry entry for this page that provides settings
//       // -- Settings is the default view for the "Action View"
//
//       ReactionCore.showActionView({
//         label: "Order Details",
//         data: this.data(),
//         props: {
//           size: "large"
//         },
//         template: "coreOrderWorkflow"
//       });
//
//       // this.render("dashboardPackages")
//       // $("body").addClass("admin");
//     } else {
//       // $("body").removeClass("admin");
//       // this.layout("coreLayout");
//     }
//
//     // return this.next();
//   },
//   waitOn: function () {
//     return this.subscribe("Orders");
//   },
//   data: function () {
//     if (Orders.findOne(this.params._id)) {
//       return ReactionCore.Collections.Orders.findOne({
//         _id: this.params._id
//       });
//     }
//   }
