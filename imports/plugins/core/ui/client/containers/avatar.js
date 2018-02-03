import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import { Reaction } from "/client/api";
import { ReactionAvatar } from "../components/avatar";

const composer = (props, onData) => {
  const targetUserId = Reaction.Router.getQueryParam("userId");
  let account = Accounts.findOne(targetUserId);
  let email;

  // If an email is provided via props, use that email
  if (props.email) {
    ({ email } = props);
  }

  // If there is no email provided, no query param provide, and the avatar is for the current user, find their account
  if (!email && !account && props.currentUser) {
    account = Accounts.findOne(Meteor.userId());
  }

  // If we now have an account, and that account has an email address, return it
  if (account && Array.isArray(account.emails)) {
    const defaultEmail = account.emails.find((emailObj) => emailObj.provides === "default");
    email = (defaultEmail && defaultEmail.address) || account.emails[0].address;
  }
  onData(null, { email });
};

registerComponent("ReactionAvatar", ReactionAvatar, composeWithTracker(composer));

export default composeWithTracker(composer)(ReactionAvatar);
