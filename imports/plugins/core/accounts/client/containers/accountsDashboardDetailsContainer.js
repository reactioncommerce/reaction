import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Accounts, Groups, Packages } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AccountsDashboardDetails from "../components/accountsDashboardDetail";
import sortUsersIntoGroups from "../helpers/accountsHelper";

const getPermissionMap = (permissions) => {
  const permissionMap = {};
  _.each(permissions, function (existing) {
    permissionMap[existing.permission] = existing.label;
  });
  return permissionMap;
};

class AccountsDashboardDetailsContainer extends Component {
  static propTypes = {
    groups: PropTypes.array,
    shopUsers: PropTypes.array
  }

  toggleGroupPermission(permissionGroup, group) {
    // TODO: Re-write this for permissions toggling
    // Meet seun for cues on how this should be properly implemented

    const permissions = [];

    if (permissionGroup.name) {
      permissions.push(permissionGroup.name);
      for (const pkgPermissions of permissionGroup.permissions) {
        permissions.push(pkgPermissions.permission);
      }
    } else {
      permissions.push(permissionGroup.permission);
    }

    if (!this.hasPermissionChecked(permissionGroup.permissions, group)) {
      group.groupData.ids.forEach((groupId) => { // eslint-disable-line
        // console.log("shsh", group[index].shopId);
        // const foundGroup = Groups.findOne({ _id: groupId });

        // const updatedPermissions = foundGroup.permissions.concat(permissions);
        // const updatedGroup = { name: foundGroup.name, permissions: updatedPermissions };
        // Meteor.call("group/updateGroup", groupId, updatedGroup, foundGroup.shopId);
      });
    } else {
      // Make another meteor call
    }
  }

  hasPermissionChecked(permissions, group) {
    let status = false;
    permissions.forEach((permission) => {
      if (group.groupData.permissions.includes(permission.permission)) {
        status = true;
      }
    });
    return status;
  }

  getGroupPermissions(groupShopId) {
    const permissionGroups = [];
    const shopId = groupShopId;
    const packages = Packages.find({
      shopId: shopId
    });

    packages.forEach(function (pkg) {
      const permissions = [];
      if (pkg.registry && pkg.enabled) {
        for (const registryItem of pkg.registry) {
          // Skip entires with missing routes
          if (!registryItem.route) {
            continue;
          }

          // Get all permissions, add them to an array
          if (registryItem.permissions) {
            for (const permission of registryItem.permissions) {
              // check needed because of non-object perms in the permissions array (e.g "admin", "owner")
              if (typeof permission === "object") {
                permission.shopId = shopId;
                permissions.push(permission);
              }
            }
          }

          // Also create an object map of those same permissions as above
          const permissionMap = getPermissionMap(permissions);
          if (!permissionMap[registryItem.route]) {
            permissions.push({
              shopId: pkg.shopId,
              permission: registryItem.name || pkg.name + "/" + registryItem.template, // launchdock-connect/connectDashboard
              icon: registryItem.icon,
              label: registryItem.label || registryItem.provides || registryItem.route
            });
          }
        }
        // TODO review this, hardcoded WIP
        const label = pkg.name.replace("reaction", "").replace(/(-.)/g, function (x) {
          return " " + x[1].toUpperCase();
        });

        return permissionGroups.push({
          shopId: pkg.shopId,
          icon: pkg.icon,
          name: pkg.name,
          label: label,
          permissions: _.uniq(permissions)
        });
      }
    });
    return permissionGroups;
  }

  render() {
    const { shopUsers, groups } = this.props;
    return (
      <AccountsDashboardDetails
        accounts={this.props.shopUsers}
        groups={sortUsersIntoGroups(shopUsers, groups)}
        // getGroupPermissions={(id) => this.getGroupPermissions(id)}
        // hasPermissionChecked={(p, id) => this.hasPermissionChecked(p, id)}
        // toggleGroupPermission={(pG, gD) => this.toggleGroupPermission(pG, gD)}
      />
    );
  }
}


const composer = (props, onData) => {
  const shopUsers = Accounts.find().fetch();
  const groups = Groups.find().fetch();
  onData(null, {
    shopUsers, groups
  });
};

export default composeWithTracker(composer, null)(AccountsDashboardDetailsContainer);
