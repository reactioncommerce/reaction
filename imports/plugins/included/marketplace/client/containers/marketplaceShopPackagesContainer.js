import { Meteor } from "meteor/meteor";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Packages } from "/lib/collections";
import { i18next } from "/client/api";
import MarketplaceShopPackages from "../components/marketplaceShopPackages";

function composer(props, onData) {
  const pkgSub = Meteor.subscribe("MarketplaceShopPackages", props.shopId);

  if (pkgSub.ready()) {
    const packages = Packages.find({ shopId: props.shopId }).fetch();
    console.log({ packages });
    onData(null, { ...props, packages, handleToggle });
  }
}

function handleToggle(status, pkgName, shopId) {
  Meteor.call("marketplace/updatePackageStatus", pkgName, status, shopId, (error, response) => {
    console.log({ error, response });
    if (error) {
      return Alerts.toast(i18next.t("marketplaceShops.errors.packageUpdate"), "error");
    }
    Alerts.toast(i18next.t("marketplaceShops.success.packageUpdate"), "success");
  });
}

export default composeWithTracker(composer)(MarketplaceShopPackages);

registerComponent(
  "MarketplaceShopPackages",
  MarketplaceShopPackages,
  composeWithTracker(composer)
);
