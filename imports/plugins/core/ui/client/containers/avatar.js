import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import { Reaction } from "/client/api";
import { ReactionAvatar } from "../components/avatar";

const composer = (props, onData) => {
  const targetUserId = Reaction.Router.getQueryParam("userId");
  let account = Accounts.findOne(targetUserId);

  if (!account) {
    account = Accounts.findOne(Meteor.userId());
  }

  let email;
  if (account && Array.isArray(account.emails)) {
    const defaultEmail = account.emails.find((emailObj) => emailObj.provides === "default");
    email = defaultEmail.address;
  }
  onData(null, { email });
};

registerComponent("ReactionAvatar", ReactionAvatar, composeWithTracker(composer));

export default composeWithTracker(composer)(ReactionAvatar);
