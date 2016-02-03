dashboard = ReactionRouter.group({
  prefix: "/dashboard"
});

//
// dashboard orders
//
dashboard.route("/orders", {
  name: "orders",
  action: function (params, queryParams) {
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
