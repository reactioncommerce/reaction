Template.dashboardShopifyOrders.helpers({
  apiConfigured: function () {
    let shopifyOrders = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-shopify-orders'
    });
    if (shopifyOrders.settings) {
      if (shopifyOrders.settings.shopify.key &&
          shopifyOrders.settings.shopify.password &&
          shopifyOrders.settings.shopify.shopname &&
          shopifyOrders.settings.shopify.sharedSecret) {
        return true;
      }
    }
    return false;
  },
  importFailsCount: function () {
    return ReactionCore.Collections.Orders.find({$or: [{infoMissing: true}, {itemMissingDetails: true}]}).count();
  },
  importFails: function () {
    return ReactionCore.Collections.Orders.find({$or: [{infoMissing: true}, {itemMissingDetails: true}]}).count() > 0;
  }
});
