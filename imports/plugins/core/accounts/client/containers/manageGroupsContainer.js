import { composeWithTracker, registerComponent } from  "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import ManageGroups from "../components/manageGroups";

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();
  const canEdit = Reaction.hasPermission("admin", Meteor.userId(), shopId);
  onData(null, { canEdit, ...props });
};

registerComponent("ManageGroupsContainer", ManageGroups, composeWithTracker(composer));

export default composeWithTracker(composer)(ManageGroups);
