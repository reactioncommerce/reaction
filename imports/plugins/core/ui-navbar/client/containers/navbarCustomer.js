import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { compose } from "recompose";
import { Reaction } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";
import withShopId from "/imports/plugins/core/graphql/lib/hocs/withShopId";
import withViewer from "/imports/plugins/core/graphql/lib/hocs/withViewer";
import withAccountCart from "/imports/plugins/core/graphql/lib/hocs/withAccountCart";
import { getSlug } from "/lib/api";
import NavBarCustomer from "../components/navbarCustomer";

export function composer(props, onData) {
  const { shop } = props;
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
    const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
    brandMedia = brandAsset && Media.findOneLocal(brandAsset.mediaId);
  }

  const hasProperPermission = Reaction.hasPermission("account/profile");

  onData(null, {
    brandMedia,
    searchEnabled,
    searchTemplate,
    hasProperPermission,
    shopSlug: getSlug(Reaction.getShopName().toLowerCase())
  });
}

registerComponent("NavBarCustomer", NavBarCustomer, [
  composeWithTracker(composer),
  withShopId,
  withShop,
  withViewer,
  withAccountCart]);

export default compose(
  composeWithTracker(composer),
  withShopId,
  withShop,
  withViewer,
  withAccountCart,
)(NavBarCustomer);
