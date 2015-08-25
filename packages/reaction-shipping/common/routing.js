Router.map(function() {
  return this.route('shipping', {
    controller: ShopSettingsController,
    path: 'dashboard/settings/shipping',
    template: 'shipping',
    waitOn: function() {
      return ReactionCore.Subscriptions.Packages;
    },
    subscriptions: function() {
      return Meteor.subscribe("Shipping");
    }
  });
});
