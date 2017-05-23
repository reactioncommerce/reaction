import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/client/api";
import { i18nextDep, i18next } from  "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import * as Collections from "/lib/collections";
import { Tags } from "/lib/collections";
import MainDropdown from "../../components/dropdown/mainDropdown";

class MainDropdownContainer extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event, value) => {
    event.preventDefault();

    if (value === "logout") {
      return Meteor.logout((error) => {
        if (error) {
          Logger.warn("Failed to logout.", error);
        }
      });
    }

    if (value.name === "createProduct") {
      Reaction.setUserPreferences("reaction-dashboard", "viewAs", "administrator");
      Meteor.call("products/createProduct", (error, productId) => {
        let currentTag;
        let currentTagId;

        if (error) {
          throw new Meteor.Error("createProduct error", error);
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

  render() {
    return (
      <div>
        <MainDropdown
          {...this.props}
          handleChange={this.handleChange}
        />
      </div>
    );
  }
}

function getCurrentUser() {
  if (typeof Reaction === "object") {
    const shopId = Reaction.getShopId();
    const user = Accounts.user();
    if (!shopId || typeof user !== "object") return null;
    // shoppers should always be guests
    const isGuest = Roles.userIsInRole(user, "guest", shopId);
    // but if a user has never logged in then they are anonymous
    const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);

    return isGuest && !isAnonymous ? user : null;
  }
  return null;
}

function getUserGravatar(currentUser, size) {
  const options = {
    secure: true,
    size: size,
    default: "identicon"
  };
  const user = currentUser || Accounts.user();
  if (!user) return false;
  const account = Collections.Accounts.findOne(user._id);
  // first we check picture exists. Picture has higher priority to display
  if (account && account.profile && account.profile.picture) {
    return account.profile.picture;
  }
  if (user.emails && user.emails.length === 1) {
    const email = user.emails[0].address;
    return Gravatar.imageUrl(email, options);
  }
}

function displayName(displayUser) {
  i18nextDep.depend();

  const user = displayUser || Accounts.user();
  if (user) {
    if (user.profile && user.profile.name) {
      return user.profile.name;
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

const composer = (props, onData) => {
  const currentUser = getCurrentUser();
  const userImage = getUserGravatar(currentUser, 40);
  const userName = displayName(currentUser);
  const adminShortcuts = getAdminShortcutIcons();
  const userShortcuts = {
    provides: "userAccountDropdown",
    enabled: true
  };

  onData(null, {
    adminShortcuts,
    currentUser,
    userImage,
    userName,
    userShortcuts
  });
};

export default composeWithTracker(composer)(MainDropdownContainer);
