Router.map(function () {
  this.route('dashboard/shopify-orders', {
    controller: ShopAdminController,
    path: '/dashboard/shopify-orders',
    template: 'dashboardShopifyOrders',
    waitOn: function () {
      return ReactionCore.Subscriptions.Packages;
    },
    subscriptions: function () {
      return this.subscribe('Orders');
    }
  });
});
