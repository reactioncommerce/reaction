import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts, Groups } from "/lib/collections";
import { lifecycle } from "recompose";
import { composeWithTracker } from "./composer";

let Logger;
let Reaction;

if (Meteor.isClient) {
  ({ Logger } = require("/client/api"));
  ({ Reaction } = require("/client/api"));
} else {
  ({ Logger } = require("/server/api"));
  ({ Reaction } = require("/server/api"));
}


/**
 * @name withCurrentUser
 * @method
 * @summary A wrapper to reactively inject the current user into a component
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "currentUser" prop
 * @memberof Components
 */
export function withCurrentUser(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { currentUser: Meteor.user() });
  })(component);
}


/**
 * @name withMoment
 * @method
 * @summary A wrapper to reactively inject the moment package into a component
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "moment" prop
 * @memberof Components
 */
export function withMoment(component) {
  return lifecycle({
    componentDidMount() {
      import("moment")
        .then((moment) => {
          moment.locale(Reaction.Locale.get().language);
          this.setState({
            moment
          });
        })
        .catch((error) => {
          Logger.debug(error, "moment.js async import error");
        });
    }
  })(component);
}


/**
 * @name withMomentTimezone
 * @method
 * @summary A wrapper to reactively inject the moment package into a component
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "moment" prop
 * @memberof Components
 */
export function withMomentTimezone(component) {
  return lifecycle({
    componentDidMount() {
      import("moment-timezone")
        .then((moment) => {
          this.setState({
            momentTimezone: moment.tz
          });
        })
        .catch((error) => {
          Logger.debug(error, "moment.js async import error");
        });
    }
  })(component);
}


/**
 * @name withCurrentAccount
 * @method
 * @summary A wrapper to reactively inject the current account into a component.
 * This assumes you have signed up and are not an anonymous user.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "currentAccount" prop
 * @memberof Components
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
 * @name withIsAdmin
 * @method
 * @summary A wrapper to reactively inject the current user's admin status.
 * Sets a boolean 'isAdmin' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with an "isAdmin" prop
 * @memberof Components
 */
export function withIsAdmin(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isAdmin: Reaction.hasAdminAccess() });
  })(component);
}

/**
 * @name withPermissions
 * @method
 * @summary A wrapper to reactively inject a user's permission based on group or roles
 * Group access is given to users at that group level and above
 * @param  {Array|String} roles String or array of strings of permissions to check. default: roles=["guest", "anonymous"]
 * @param  {String} group Slug title of a group to check against. Group option supercedes roles option. default: group="customer".
 * @return {Function} the new wrapped component with a "hasPermissions" prop
 * @memberof Components
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
 * @name withIsOwner
 * @method
 * @summary A wrapper to reactively inject the current user's owner status.
 * Sets a boolean 'isOwner' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with an "isOwner" prop
 * @memberof Components
 */
export function withIsOwner(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isOwner: Reaction.hasOwnerAccess() });
  })(component);
}
