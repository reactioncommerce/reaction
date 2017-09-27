import _ from "lodash";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";
import { Media, Shops } from "/lib/collections";

function composer(props, onData) {
  const shop = Shops.findOne(Reaction.getShopId());
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
  let searchEnabled;
  let searchTemplate;
  let bandMedia;

  if (searchPackage.length) {
    searchEnabled = true;
    searchTemplate = searchPackage[0].template;
  } else {
    searchEnabled = false;
  }

  if (shop && Array.isArray(shop.brandAssets)) {
    const brandAsset = _.find(this.getShop().brandAssets, (asset) => asset.type === "navbarBrandImage");
    bandMedia = Media.findOne(brandAsset.mediaId);
  }

  const hasProperPermission = Reaction.hasPermission("account/profile");

  onData(null, {
    shop,
    bandMedia,
    searchEnabled,
    searchTemplate,
    hasProperPermission
  });
}

registerComponent("NavBar", NavBar, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBar);
