Template.coreNavigationBrand.helpers({
  logo() {
    const shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId());

    if (_.isArray(shop.brandAssets)) {
      const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
      return ReactionCore.Collections.Media.findOne(brandAsset.mediaId);
    }

    return false;
  }
});
