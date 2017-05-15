import React, { Component } from "react";
// import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import * as Collections from "/lib/collections";
import { i18nextDep } from  "/client/modules/i18n/main.js";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import MainDropdown from "../../components/dropdown/mainDropdown";

class MainDropdownContainer extends Component {
  render() {
    return (
      <div>
        <MainDropdown {...this.props}/>
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
    console.log("Gravatar stuff", Gravatar.imageUrl(email, options));
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



const composer = (props, onData) => {
  const currentUser = getCurrentUser();
  const userImage = getUserGravatar(currentUser, 40);
  const userName = displayName(currentUser);

  onData(null, {
    currentUser: currentUser,
    userImage: userImage,
    userName: userName
  });
};

export default composeWithTracker(composer, null)(MainDropdownContainer);
