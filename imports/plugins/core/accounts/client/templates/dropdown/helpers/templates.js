import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";
import { Reaction, i18next, i18nextDep } from "/client/api";

/**
 * @method displayName
 * @memberof BlazeTemplateHelpers
 * @summary Return a registered and logged in user's name or Guest
 * @return {String} username
 */
Template.registerHelper("displayName", (displayUser) => {
  i18nextDep.depend();
  const shopId = Reaction.getShopId();
  const user = displayUser || Accounts.user();
  if (user) {
    if (user.profile && user.profile.name) {
      return user.profile.name;
    } else if (user.username) {
      return user.username;
    }

    if (Reaction.hasPermission("account/profile", user._id || user.userId, shopId)) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  }
});
