import { composeWithTracker, registerComponent } from  "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import { Reaction } from "/client/api";
import MarketplaceShops from "../components/marketplaceShops";

const onWorkflowChange = (shopId, value) => {
  Meteor.call("marketplace/updateShopWorkflow", shopId, value);
};

const composer = (props, onData) => {
  // Subscribe to MerchantShops
  const merchantShopSub = Meteor.subscribe("MerchantShops");

  // Get all shops (excluding the primary shop) if subscription is ready
  if (merchantShopSub.ready()) {
    const shops = Shops.find({
      _id: {
        $nin: [Reaction.getPrimaryShopId()]
      }
    }).fetch();

    onData(null, {
      shops,
      onWorkflowChange
    });
  }
};

registerComponent("MarketplaceShops", MarketplaceShops, composeWithTracker(composer));

export default composeWithTracker(composer)(MarketplaceShops);
