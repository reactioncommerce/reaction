import { compose, withProps } from "recompose";
import { Meteor } from "meteor/meteor";
import React from "react";
import { Components } from "@reactioncommerce/reaction-components";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { i18nextDep, i18next, Reaction, Logger } from "/client/api";
import MainDropdownCustomer from "../components/mainDropdownCustomer";
import withViewer from "/imports/plugins/core/graphql/lib/hocs/withViewer";

function getUserAvatarCustomer(user) {
  if (user && user.profile && user.profile.picture) {
    const { picture } = user.profile;
    return <Components.ReactionAvatar className={"accounts-avatar"} size={30} src={picture} />;
  }

  if (user && user.emailRecords && user.emailRecords.length === 1) {
    const email = user.emailRecords[0].address;
    return <Components.ReactionAvatar className={"accounts-avatar"} email={email} size={30} />;
  }

  return <Components.ReactionAvatar className={"accounts-avatar"} size={30} />;
}

function isUserSignedIn(user) {
  return user && user.emailRecords && user.emailRecords.length > 0;
}

function displayName(user) {
  i18nextDep.depend();

  if (user) {
    if (user.name) {
      return user.name;
    }
    return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
  }
}

const composer = ({ viewer, refetchViewer }, onData) => {
  const userImage = getUserAvatarCustomer(viewer);
  const userName = displayName(viewer);

  const handleChange = (event, value) => {
    event.preventDefault();
  
    if (value === "logout") {
      return Meteor.logout((error) => {
        refetchViewer();
        if (error) {
          Logger.error(error, "Failed to logout.");
        }
  
        // Resets the app to show the primary shop as the active shop when a user logs out.
        // When an admin user is switching back and forth between shops, the app will keep the
        // activeShopId as the last shop visited. If an admin user logs out, the app will stay on that shop
        // for any new user who uses the same browser, temporarily, until the app is refreshed. This fixes that issue.
        Reaction.setShopId(Reaction.getPrimaryShopId());
      });
    }
  
    if (value.route || value.name) {
      const route = value.name || value.route;
      return Reaction.Router.go(route);
    }
  }

  onData(null, {
    userImage,
    userName,
    handleChange,
    currentAccount: isUserSignedIn(viewer)
  });
};

const handlers = {
  userShortcuts: {
    provides: "userAccountDropdown",
    enabled: true
  }
};

registerComponent("MainDropdownCustomer", MainDropdownCustomer, [
  withViewer,
  withProps(handlers),
  composeWithTracker(composer, false)
]);

export default compose(
  withViewer,
  withProps(handlers),
  composeWithTracker(composer, false)
)(MainDropdownCustomer);
