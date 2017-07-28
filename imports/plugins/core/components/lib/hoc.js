import { composeWithTracker } from "./composer";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts } from "/lib/collections";

let Reaction;

if (Meteor.isClient) {
  Reaction = require("/client/api").Reaction;
} else {
  Reaction = require("/server/api").Reaction;
}


/**
 * A wrapper to reactively inject the current user into a component
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "currentUser" prop
 */
export function withCurrentUser(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { currentUser: Meteor.user() });
  })(component);
}


/**
 * A wrapper to reactively inject the current account into a component.
 * This assumes you have signed up and are not an anonymous user.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "currentAccount" prop
 */
export function withCurrentAccount(component) {
  return composeWithTracker((props, onData) => {
    const shopId = Reaction.getShopId();
    const user = Meteor.user();

    if (!shopId || !user) {
      return null;
    }

    // shoppers should always be guests
    const isGuest = Roles.userIsInRole(user, "guest", shopId);
    // but if a user has never logged in then they are anonymous
    const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);

    const account = Accounts.findOne(user._id);

    onData(null, { currentAccount: isGuest && !isAnonymous && account });
  })(component);
}


/**
 * A wrapper to reactively inject the current user's admin status.
 * Sets a boolean 'isAdmin' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with an "isAdmin" prop
 */
export function withIsAdmin(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isAdmin: Reaction.hasAdminAccess() });
  })(component);
}


/**
 * A wrapper to reactively inject the current user's owner status.
 * Sets a boolean 'isOwner' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with an "isOwner" prop
 */
export function withIsOwner(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isOwner: Reaction.hasOwnerAccess() });
  })(component);
}
