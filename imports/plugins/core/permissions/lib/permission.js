import React, { Component, Children } from "react";
import PropTypes from "prop-types";
import { Roles } from "meteor/alanning:roles";
import { composeWithTracker } from "/lib/api/compose";
import url from "url"
import { Jobs, Packages, Shops } from "/lib/collections";


class Permission extends Component {
  static propTypes = {
    children: PropTypes.node,
    hasPermission: PropTypes.bool,
    roles: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string])
  }

  render() {
    console.log(this.props);
    if (this.props.hasPermission) {
      return Children.only(this.props.children);
    }

    return null;
  }
}

export function withPermissions(roles = ["guest", "anonymous"]) {
  return composeWithTracker((props, onData) => {
    onData(null, {
      hasPermission: hasPermission(props.roles) //true //Roles.userIsInRole(Meteor.user(), roles)
    });
  });
}

/**
 * hasPermission - server
 * server permissions checks
 * hasPermission exists on both the server and the client.
 * @param {String | Array} checkPermissions -String or Array of permissions if empty, defaults to "admin, owner"
 * @param {String} userId - userId, defaults to Meteor.userId()
 * @param {String} checkGroup group - default to shopId
 * @return {Boolean} Boolean - true if has permission
 */
export function hasPermission(checkPermissions, userId = Meteor.userId(), checkGroup = getShopId()) {
  // check(checkPermissions, Match.OneOf(String, Array)); check(userId, String); check(checkGroup,
  // Match.Optional(String));

  let permissions;
  // default group to the shop or global if shop isn't defined for some reason.
  let group;
  if (checkGroup !== undefined && typeof checkGroup === "string") {
    group = checkGroup;
  } else {
    group = getShopId() || Roles.GLOBAL_GROUP;
  }

  // permissions can be either a string or an array we'll force it into an array and use that
  if (checkPermissions === undefined) {
    permissions = ["owner"];
  } else if (typeof checkPermissions === "string") {
    permissions = [checkPermissions];
  } else {
    permissions = checkPermissions;
  }

  // if the user has admin, owner permissions we'll always check if those roles are enough
  permissions.push("owner");
  permissions = _.uniq(permissions);

  // return if user has permissions in the group
  if (Roles.userIsInRole(userId, permissions, group)) {
    return true;
  }

  // global roles check
  const sellerShopPermissions = Roles.getGroupsForUser(userId, "admin");

  // we're looking for seller permissions.
  if (sellerShopPermissions) {
    // loop through shops roles and check permissions
    for (const key in sellerShopPermissions) {
      if (key) {
        const shop = sellerShopPermissions[key];
        if (Roles.userIsInRole(userId, permissions, shop)) {
          return true;
        }
      }
    }
  }
  // no specific permissions found returning false
  return false;
}

export function getShopId() {
  const domain = url.parse(Meteor.absoluteUrl()).hostname;
  const shop = Shops.find({
    domains: domain
  }, {
    limit: 1,
    fields: {
      _id: 1
    }
  }).fetch()[0];
  return shop && shop._id;
}


// function PermissionContainer(props) {
//   return withPermissions()(
//
//     });
// }
//
// export default PermissionContainer;

export default withPermissions()(Permission);
