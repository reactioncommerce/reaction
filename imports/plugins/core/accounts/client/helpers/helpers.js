import { Template } from "meteor/templating";
import { Gravatar } from "meteor/jparker:gravatar";
import * as Collections from "/lib/collections";

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

export function getGravatar(user) {
  const options = {
    secure: true,
    size: 30,
    default: "identicon"
  };
  if (!user) { return false; }
  const account = Collections.Accounts.findOne(user._id);
  if (account && account.profile && account.profile.picture) {
    return account.profile.picture;
  }
  if (user.emails && user.emails.length > 0) {
    const email = user.emails[0].address;
    return Gravatar.imageUrl(email, options);
  }
}
