ReactionRouter.map(function() {
  return this.route("dashboard/social", {
    controller: ShopAdminController,
    path: "dashboard/social",
    template: "socialDashboard",
    waitOn: function() {
      return ReactionCore.Subscriptions.Packages;
    }
  });
});
