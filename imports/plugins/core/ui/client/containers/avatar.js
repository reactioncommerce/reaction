import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import { ReactionAvatar } from "../components/avatar";

const composer = (props, onData) => {
  const user = Accounts.findOne(Meteor.userId());
  const email = user.emails[0].address;
  onData(null, { email });
};

registerComponent("ReactionAvatar", ReactionAvatar, composeWithTracker(composer));

export default composeWithTracker(composer)(ReactionAvatar);
