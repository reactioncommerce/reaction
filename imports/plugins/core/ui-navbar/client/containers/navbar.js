import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";
import { Shops } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/client";

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
export function composer(props, onData) {
  const shop = Shops.findOne({ _id: Reaction.getShopId() });
  if (!shop) throw new Error(`No shop found with shop ID ${Reaction.getShopId()}`);

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
   * @method
   * @summary Handle change in selected shop
   * @param {script} event DOM Event
   * @param {String} shopId - selected shopId
   * @since 1.5.8
   * @returns {void}
   * @private
   */
  const handleShopSelectChange = (event, shopId) => {
    Reaction.setShopId(shopId);
  };

  const isLoggedIn = !!(shop && user && !Roles.userIsInRole(user._id, "anonymous", shop._id));

  if (searchPackage.length && isLoggedIn) {
    searchEnabled = true;
    searchTemplate = searchPackage[0].template;
  } else {
    searchEnabled = false;
  }

  if (shop && Array.isArray(shop.brandAssets)) {
    const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
    brandMedia = brandAsset && Media.findOneLocal(brandAsset.mediaId);
  }

  const hasProperPermission = Reaction.hasPermission("account/profile");

  onData(null, {
    brandMedia,
    handleShopSelectChange,
    hasProperPermission,
    searchEnabled,
    searchTemplate,
    shop,
    shops,
    visibility: {
      hamburger: true,
      brand: true,
      tags: isLoggedIn,
      search: true,
      notifications: true,
      languages: true,
      currency: true,
      mainDropdown: true
    }
  });
}

registerComponent("NavBar", NavBar, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBar);
