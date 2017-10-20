import React from "react";
import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";
import * as Collections from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";

export const LoginFormSharedHelpers = {
  messages: function () {
    return Template.instance().formMessages.get();
  },

  hasError(error) {
    // True here means the field is valid
    // We're checking if theres some other message to display
    if (error !== true && typeof error !== "undefined") {
      return "has-error has-feedback";
    }
  },
  capitalize: function (str) {
    const finalString = str === null ? "" : String(str);
    return finalString.charAt(0).toUpperCase() + finalString.slice(1);
  }

};

export function getUserAvatar(currentUser) {
  const user = currentUser || Accounts.user();

  const account = Collections.Accounts.findOne(user._id);
  // first we check picture exists. Picture has higher priority to display
  if (account && account.profile && account.profile.picture) {
    const picture = account.profile.picture;

    return (
      <Components.ReactionAvatar
        className={"accounts-avatar"}
        size={30}
        src={picture}
      />
    );
  }
  if (user.emails && user.emails.length === 1) {
    const email = user.emails[0].address;

    return (
      <Components.ReactionAvatar
        className={"accounts-avatar"}
        email={email}
        size={30}
      />
    );
  }

  return (
    <Components.ReactionAvatar
      className={"accounts-avatar"}
      size={30}
    />
  );
}
