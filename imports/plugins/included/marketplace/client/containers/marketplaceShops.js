import { composeWithTracker, registerComponent } from  "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import MarketplaceShops from "../components/marketplaceShops";


const onWorkflowChange = (shopId, value) => {
  Meteor.call("marketplace/updateShopWorkflow", shopId, value);
};

const composer = (props, onData) => {
  const shops = Shops.find({}).fetch();

  onData(null, {
    shops,
    onWorkflowChange
  });
};

registerComponent("MarketplaceShops", MarketplaceShops, composeWithTracker(composer));

export default composeWithTracker(composer)(MarketplaceShops);
