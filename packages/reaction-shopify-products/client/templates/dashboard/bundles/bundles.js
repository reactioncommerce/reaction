Template.dashboardProductBundles.onCreated(function () {
  this.subscribe('ShopifyProducts/Bundles');
});

Template.dashboardProductBundles.helpers({
  bundles: function () {
    return ReactionCore.Collections.Bundles.find();
  }
});

Template.dashboardProductBundle.helpers({
  colorWaysCount: function (colorWays) {
    return Object.keys(colorWays).length;
  },
  colorWaysKeys: function (colorWays) {
    return Object.keys(colorWays);
  }
});
