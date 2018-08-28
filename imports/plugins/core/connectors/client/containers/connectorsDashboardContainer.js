import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";
import { ConnectorsDashboard } from "../components";

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const packageSub = Meteor.subscribe("Packages", shopId);
  if (packageSub.ready()) {
    const packages = Packages.find({ shopId, "registry.provides": "connectorsScreen" }).fetch();
    onData(null, { packages, ...props });
  }
};


registerComponent("ConnectorsDashboard", ConnectorsDashboard, composeWithTracker(composer));

export default composeWithTracker(composer)(ConnectorsDashboard);
