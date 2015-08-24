Router.map(function() {
  return this.route("social", {
    controller: ShopAdminController,
    path: 'dashboard/settings/social',
    template: 'socialDashboard',
    waitOn: function() {
      return ReactionCore.Subscriptions.Packages;
    }
  });
});
