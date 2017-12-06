import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Packages } from "/lib/collections";
import MarketplaceShopPackages from "../components/marketplaceShopPackages";

function composer(props, onData) {
  const pkgSub = Meteor.subscribe("MarketplaceShopPackages", props.shopId);

  if (pkgSub.ready()) {
    const packages = Packages.find({ shopId: props.shopId }).fetch();

    onData(null, { packages, handleToggle });
  }
}

function handleToggle(status, pkgName) {
  return { status, pkgName };
}

export default composeWithTracker(composer)(MarketplaceShopPackages);

registerComponent(
  "MarketplaceShopPackages",
  MarketplaceShopPackages,
  composeWithTracker(composer)
);
