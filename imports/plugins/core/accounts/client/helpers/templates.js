import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { Reaction, i18next, i18nextDep } from "/client/api";
import * as Collections from "/lib/collections";


/**
 * registerHelper displayName
 */
Template.registerHelper("displayName", function (displayUser) {
  i18nextDep.depend();

  const user = displayUser || Collections.Accounts.findOne(Meteor.userId());
  if (user) {
    if (user.name) {
      return user.name;
    } else if (user.username) {
      return user.username;
    }

    // todo: previous check was user.services !== "anonymous", "resume". Is this
    // new check covers previous check?
    if (Roles.userIsInRole(user._id || user.userId, "account/profile",
      Reaction.getShopId())) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  }
});

/**
 * registerHelper fName
 */

Template.registerHelper("fName", function (displayUser) {
  const user = displayUser || Meteor.user();
  if (user && user.profile && user.profile.name) {
    return user.profile.name.split(" ")[0];
  } else if (user && user.username) {
    return user.username.name.split(" ")[0];
  }
  if (user && user.services) {
    const username = (function () {
      switch (false) {
        case !user.services.twitter:
          return user.services.twitter.first_name;
        case !user.services.google:
          return user.services.google.given_name;
        case !user.services.facebook:
          return user.services.facebook.first_name;
        case !user.services.instagram:
          return user.services.instagram.first_name;
        case !user.services.pinterest:
          return user.services.pinterest.first_name;
        default:
          return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
      }
    })();
    return username;
  }
  return i18next.t("accountsUI.signIn", { defaultValue: "Sign in" });
});
