import _ from "lodash";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";
import { Media, Shops } from "/lib/collections";

function composer(props, onData) {
  const shop = Shops.findOne(Reaction.getShopId());
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
  const user = Meteor.user();
  let searchEnabled;
  let searchTemplate;
  let brandMedia;

  let shops;

  if (user && user.roles) {
    // Get all shops for which user has roles
    shops = Shops.find({
      $and: [
        { _id: { $in: Object.keys(user.roles) } },
        { $or: [{ "workflow.status": "active" }, { _id: Reaction.getPrimaryShopId() }] }
      ]
    }).fetch();
  }

  /**
   * handleShopSelectChange
   * @method
   * @summary Handle change in selected shop
   * @param {script} event
   * @param {String} shopId - selected shopId
   * @since 1.5.8
   * @return {void}
  */
  const handleShopSelectChange = (event, shopId) => {
    // Test that shopId is a valid ID
    if (/^[A-Za-z0-9]{17}$/.test(shopId)) {
      Reaction.setShopId(shopId);
    }
  };
  if (searchPackage.length) {
    searchEnabled = true;
    searchTemplate = searchPackage[0].template;
  } else {
    searchEnabled = false;
  }

  if (shop && Array.isArray(shop.brandAssets)) {
    const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
    brandMedia = Media.findOne(brandAsset.mediaId);
  }

  const hasProperPermission = Reaction.hasPermission("account/profile");

  onData(null, {
    shop,
    brandMedia,
    searchEnabled,
    searchTemplate,
    hasProperPermission,
    shops,
    handleShopSelectChange
  });
}

registerComponent("NavBar", NavBar, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBar);
