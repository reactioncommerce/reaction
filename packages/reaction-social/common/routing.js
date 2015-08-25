Router.map(function() {
  return this.route("social", {
    controller: ShopSettingsController,
    path: 'dashboard/settings/social',
    template: 'socialDashboard',
    waitOn: function() {
      return ReactionCore.Subscriptions.Packages;
    }
  });
});
