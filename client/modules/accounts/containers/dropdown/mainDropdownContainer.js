import React, { Component } from "react";
// import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
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

const composer = (props, onData) => {
  const currentUser = getCurrentUser();
  console.log("currentUser", currentUser);
  onData(null, {
    currentUser: currentUser
  });
};

export default composeWithTracker(composer, null)(MainDropdownContainer);
