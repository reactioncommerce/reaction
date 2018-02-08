import { composeWithTracker, registerComponent } from  "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/client/api";
import EditGroup from "../components/editGroup";

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const canEdit = Reaction.hasPermission("admin", Meteor.userId(), shopId);
  const pkg = Meteor.subscribe("Packages", shopId);
  if (pkg.ready()) {
    const packages = Packages.find({ shopId }).fetch();
    onData(null, { packages, canEdit, ...props });
  }
};

registerComponent("EditGroup", EditGroup, composeWithTracker(composer));

export default composeWithTracker(composer)(EditGroup);
