import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import { Reaction } from "/client/api";
import { ReactionAvatar } from "../components/avatar";

const composer = (props, onData) => {
  const targetUserId = Reaction.Router.getQueryParam("userId");
  let user = Accounts.findOne(targetUserId);

  if (!user) {
    user = Accounts.findOne(Meteor.userId());
  }

  let email;
  if (user.email && user.emails[0]) {
    email = user.emails[0].address;
  }
  onData(null, { email });
};

registerComponent("ReactionAvatar", ReactionAvatar, composeWithTracker(composer));

export default composeWithTracker(composer)(ReactionAvatar);
