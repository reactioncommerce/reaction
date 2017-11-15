import _ from "lodash";
import React from "react";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";
import { Media, Shops } from "/lib/collections";

function composer(props, onData) {
  const shop = Shops.findOne(Reaction.getShopId());
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
  let searchEnabled;
  let searchTemplate;
  let brandMedia;

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
    hasProperPermission
  });
}

registerComponent("NavBar", NavBar, composeWithTracker(composer));

registerComponent("NavBarCheckout", (props, context) => {
  const visibility = {
    hamburger: false,
    brand: true,
    tags: false,
    search: false,
    notifications: false,
    languages: false,
    currency: false,
    mainDropdown: false,
    cartContainer: false
  };
  const newProps = {
    ...props,
    visibility
  }
  return React.createElement(NavBar, newProps, context);
}, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBar);
