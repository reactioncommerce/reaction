import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker, withCurrentAccount } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Session } from "meteor/session";
import { Reaction, Logger } from "/client/api";
import { i18nextDep, i18next } from  "/client/api";
import { Tags } from "/lib/collections";
import MainDropdown from "../components/mainDropdown";
import { getUserAvatar } from "/imports/plugins/core/accounts/client/helpers/helpers";

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
    if (Roles.userIsInRole(user._id || user.userId, "account/profile",
      Reaction.getShopId())) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  }
}

function getAdminShortcutIcons() {
  // get shortcuts with audience permissions based on user roles
  const roles = Roles.getRolesForUser(Meteor.userId(), Reaction.getShopId());

  return {
    provides: "shortcut",
    enabled: true,
    audience: roles
  };
}

function handleChange(event, value) {
  event.preventDefault();

  if (value === "logout") {
    return Meteor.logout((error) => {
      if (error) {
        Logger.error(error, "Failed to logout.");
      }
    });
  }

  if (value.name === "createProduct") {
    Reaction.setUserPreferences("reaction-dashboard", "viewAs", "administrator");
    Meteor.call("products/createProduct", (error, productId) => {
      let currentTag;
      let currentTagId;

      if (error) {
        throw new Meteor.Error("create-product-error", error);
      } else if (productId) {
        currentTagId = Session.get("currentTag");
        currentTag = Tags.findOne(currentTagId);
        if (currentTag) {
          Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
        }
        // go to new product
        Reaction.Router.go("product", {
          handle: productId
        });
      }
    });
  } else if (value.name !== "account/profile") {
    return Reaction.showActionView(value);
  } else if (value.route || value.name) {
    const route = value.name || value.route;
    return Reaction.Router.go(route);
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
