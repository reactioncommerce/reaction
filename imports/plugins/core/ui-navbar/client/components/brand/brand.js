import { Reaction } from "/client/api";
import { Media, Shops } from "/lib/collections";

Template.coreNavigationBrand.helpers({
  logo() {
    const shop = Shops.findOne(Reaction.getShopId());

    if (_.isArray(shop.brandAssets)) {
      const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
      return Media.findOne(brandAsset.mediaId);
    }

    return false;
  }
});
