Router.route('dashboard/shopify-products', {
  controller: ShopAdminController,
  path: '/dashboard/shopify-products',
  template: 'dashboardShopifyProducts',
  waitOn: function () {
    return ReactionCore.Subscriptions.Packages;
  }
});

ProductBundlesAdminController = ShopAdminController.extend({
  onBeforeAction: function () {
    // TODO: Extract bundles into it's own package
    let shopifyProducts = ReactionCore.Collections.Packages.findOne({
      name: 'reaction-shopify-products'
    });
    if (!shopifyProducts.enabled) {
      this.render('notFound');
    } else {
      this.next();
    }
  }
});

Router.route('dashboard/product-bundles', {
  name: 'product-bundles',
  controller: ProductBundlesAdminController,
  path: '/dashboard/product-bundles',
  template: 'dashboardProductBundles'
});

Router.route('dashboard/product-bundles/:_id', {
  name: 'product-bundle',
  controller: ProductBundlesAdminController,
  path: '/dashboard/product-bundles/:_id',
  template: 'dashboardBundleDetail'
});
