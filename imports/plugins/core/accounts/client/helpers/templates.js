import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { Reaction, i18next, i18nextDep } from "/client/api";
import * as Collections from "/lib/collections";

/**
 * @method displayName
 * @memberof BlazeTemplateHelpers
 * @summary Return a registered and logged in user's name or Guest
 * @return {String} username
 */
Template.registerHelper("displayName", (displayUser) => {
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
    if (Roles.userIsInRole(
      user._id || user.userId, "account/profile",
      Reaction.getShopId()
    )) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  }
});
