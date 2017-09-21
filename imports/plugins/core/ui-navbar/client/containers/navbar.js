import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import NavBar from "../components/navbar";


function composer(props, onData) {
  const searchPackage = Reaction.Apps({ provides: "ui-search" });

  let searchEnabled;
  let searchTemplate;

  if (searchPackage.length) {
    searchEnabled = true;
    searchTemplate = searchPackage[0].template;
  } else {
    searchEnabled = false;
  }

  const hasProperPermission = Reaction.hasPermission("account/profile");
  // this condition checks whether The suscription to the shops collection is
  // ready before it proceeds to send the data as props to the components
  if (Reaction.Subscriptions.PrimaryShop.ready() &&
      Reaction.Subscriptions.MerchantShops.ready()) {
    const shop = Shops.findOne(Reaction.getShopId());
    onData(null, {
      shop,
      searchEnabled,
      searchTemplate,
      hasProperPermission
    });
  }
}

registerComponent("NavBar", NavBar, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBar);
