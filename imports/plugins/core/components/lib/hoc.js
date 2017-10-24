import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts, Groups } from "/lib/collections";
import { composeWithTracker } from "./composer";

/**
 * @file Reaction Components API
 *
 * @module components
 */

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

    const accSub = Meteor.subscribe("Accounts", user._id);
    if (accSub.ready()) {
      // shoppers should always be guests
      const isGuest = Reaction.hasPermission("guest");
      // but if a user has never logged in then they are anonymous
      const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);
      // this check for "anonymous" uses userIsInRole instead of hasPermission because hasPermission
      // always return `true` when logged in as the owner.
      // But in this case, the anonymous check should be false when a user is logged in
      const account = Accounts.findOne(user._id);

      onData(null, { currentAccount: isGuest && !isAnonymous && account });
    }
  }, false)(component);
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
 * A wrapper to reactively inject a user's permission based on group or roles
 * Group access is given to users at that group level and above
 * @param  {Array|String} roles String or array of strings of permissions to check. default: roles=["guest", "anonymous"]
 * @param  {String} group Slug title of a group to check against. Group option supercedes roles option. default: group="customer".
 * @return {Function} the new wrapped component with a "hasPermissions" prop
 */
export function withPermissions({ roles = ["guest", "anonymous"], group }) {
  return composeWithTracker((props, onData) => {
    let hasPermissions = Reaction.hasPermission(roles);

    if (!group) {
      return onData(null, { hasPermissions });
    }

    // if group is passed, use group access instead
    const grpSub = Meteor.subscribe("Groups");

    if (grpSub.ready()) {
      const grp = Groups.findOne({ slug: group });

      if (grp && grp.permissions) {
        const user = Meteor.user();
        const permissions = user.roles[Reaction.getShopId()] || [];
        // checks that userPermissions includes all elements from groupPermissions
        hasPermissions = _.difference(grp.permissions, permissions).length === 0;
      }

      onData(null, { hasPermissions });
    }
  });
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
