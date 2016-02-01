dashboard = ReactionRouter.group({
  prefix: "/dashboard"
});

//
// dashboard orders
//
// dashboard.route("/orders", {
//   name: "dashboard/orders",
//   action: function (params, queryParams) {
//     console.log("orders", params, queryParams);
//
//     let dashboardLayout =  {
//       workflow: "coreOrderWorkflow"
//     };
//     // initialize reaction layout
//     renderLayout(dashboardLayout);
//   }
// });

//
// dashboard orders
//
dashboard.route("/orders", {
  name: "orders",
  action: function (params, queryParams) {
    console.log("orders", params, queryParams);

    let dashboardLayout =  {
      workflow: "coreOrderWorkflow"
    };
    // initialize reaction layout
    renderLayout(dashboardLayout);
    // enable order details view
    if (ReactionCore.hasDashboardAccess() && queryParams._id) {
      ReactionCore.showActionView({
        label: "Order Details",
        props: {
          size: "large"
        },
        template: "coreOrderWorkflow"
      });
    }
  },
  data: function (id) {
    if (ReactionCore.Collections.Orders.findOne(id)) {
      return ReactionCore.Collections.Orders.findOne({
        _id: id
      });
    }
  }
});

// this.route("dashboard/orders", {
//   controller: ShopAdminController,
//   path: "dashboard/orders/:_id?",
//   template: "orders",
//   onAfterAction: function () {
//
//
//       if (ReactionCore.hasDashboardAccess() && this.params._id) {
//         // this.layout("coreAdminLayout");
//         // Find a registry entry for this page that provides settings
//         // -- Settings is the default view for the "Action View"
//
//         ReactionCore.showActionView({
//           label: "Order Details",
//           data: this.data(),
//           props: {
//             size: "large"
//           },
//           template: "coreOrderWorkflow"
//         });
//
//         // this.render("dashboardPackages")
//         // $("body").addClass("admin");
//       } else {
//         // $("body").removeClass("admin");
//         // this.layout("coreLayout");
//       }
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
// });
