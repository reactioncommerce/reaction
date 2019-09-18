import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { registerComponent, composeWithTracker, withCurrentAccount } from "@reactioncommerce/reaction-components";
import { i18nextDep, i18next, Reaction, Logger } from "/client/api";
import { getUserAvatar } from "/imports/plugins/core/accounts/client/helpers/helpers";
import MainDropdown from "../components/mainDropdown";

/**
 * @summary Returns the display name for a user
 * @param {Object} [displayUser] The user object. Defaults to logged in user.
 * @returns {String} Display name for a user
 */
function displayName(displayUser) {
  i18nextDep.depend();

  const user = displayUser || Accounts.user();

  if (user) {
    if (user.name) {
      return user.name;
    } else if (user.username) {
      return user.username;
    } else if (user.profile && user.profile.name) {
      return user.profile.name;
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

  return null;
}

/**
 * @summary get shortcuts with audience permissions based on user roles
 * @returns {Object} Object with `provides`, `enabled`, and `audience` fields
 */
function getAdminShortcutIcons() {
  const roles = Roles.getRolesForUser(Reaction.getUserId(), Reaction.getShopId());

  return {
    provides: "shortcut",
    enabled: true,
    audience: roles
  };
}

/**
 * @summary Selection change handler
 * @param {Event} event Event
 * @param {String} value New selected value
 * @returns {undefined}
 */
function handleChange(event, value) {
  event.preventDefault();

  if (value === "logout") {
    Meteor.logout((error) => {
      if (error) {
        Logger.error(error, "Failed to logout.");
      }

      // Resets the app to show the primary shop as the active shop when a user logs out.
      // When an admin user is switching back and forth between shops, the app will keep the
      // activeShopId as the last shop visited. If an admin user logs out, the app will stay on that shop
      // for any new user who uses the same browser, temporarily, until the app is refreshed. This fixes that issue.
      Reaction.setShopId(Reaction.getPrimaryShopId());
    });
  } else if (value.name !== "account/profile") {
    Reaction.showActionView(value);
  } else if (value.route || value.name) {
    const route = value.name || value.route;
    Reaction.Router.go(route);
  }
}

const composer = ({ currentAccount }, onData) => {
  const userImage = getUserAvatar(currentAccount);
  const userName = displayName(currentAccount);
  const adminShortcuts = getAdminShortcutIcons();

  onData(null, {
    adminShortcuts,
    userImage,
    userName
  });
};

const handlers = {
  handleChange,
  userShortcuts: {
    provides: "userAccountDropdown",
    enabled: true
  }
};

registerComponent("MainDropdown", MainDropdown, [
  withCurrentAccount,
  withProps(handlers),
  composeWithTracker(composer, false)
]);

export default compose(
  withCurrentAccount,
  withProps(handlers),
  composeWithTracker(composer, false)
)(MainDropdown);
