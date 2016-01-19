Router.map(function () {
  return this.route('dashboard/inventory', {
    controller: ShopAdminController,
    path: 'dashboard/inventory',
    template: 'dashboardInventory',
    waitOn: function() {
      return ReactionCore.Subscriptions.Packages;
    },
    subscriptions: function() {
      return ReactionCore.Subscriptions.Inventory;
    }
  });
});
