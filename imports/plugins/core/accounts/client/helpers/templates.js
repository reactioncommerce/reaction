import { Template } from "meteor/templating";
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
  const shopId = Reaction.getShopId();
  const user = displayUser || Collections.Accounts.findOne(Reaction.getUserId());
  if (user) {
    if (user.name) {
      return user.name;
    } else if (user.username) {
      return user.username;
    }

    if (Reaction.hasPermission("account/profile", user._id || user.userId, shopId)) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  }
});
