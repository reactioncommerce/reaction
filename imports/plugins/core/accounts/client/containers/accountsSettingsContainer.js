import React, { Component } from "react";
import PropTypes from "prop-types";
// import { Reaction } from "/client/api";
import _ from "lodash";
import { Accounts, Groups, Packages } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
// import { Meteor } from "meteor/meteor";
import SettingsComponent from "../components/settings";
import getSortedGroups from "../helpers/accountsHelper";

const getPermissionMap = (permissions) => {
  const permissionMap = {};
  _.each(permissions, function (existing) {
    permissionMap[existing.permission] = existing.label;
  });
  return permissionMap;
};

class SettingsContainer extends Component {
  static propTypes = {
    groups: PropTypes.array,
    shopUsers: PropTypes.array
  }

  toggleGroupPermission(/* permissionGroup, group */) {
    // TODO: Re-write this for permissions toggling

    // const permissions = [];

    // if (!this.shopId) {
    //   throw new Meteor.Error("Shop is required");
    // }
    // if (self.name) {
    //   permissions.push(self.name);
    //   for (const pkgPermissions of self.permissions) {
    //     permissions.push(pkgPermissions.permission);
    //   }
    // } else {
    //   permissions.push(self.permission);
    // }

    // if (Template.instance().$(event.currentTarget).is(":checked")) {
    //   Meteor.call("accounts/addUserPermissions", member.userId, permissions, this.shopId);
    // } else {
    //   Meteor.call("accounts/removeUserPermissions", member.userId, permissions, this.shopId);
    // }
  }

  hasPermissionChecked(permissions, group) {
    let status = false;
    permissions.forEach((permission) => {
      if (group.groupData.group.permissions.includes(permission.permission)) {
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
      <SettingsComponent
        accounts={this.props.shopUsers}
        groups={getSortedGroups(shopUsers, groups)}
        getGroupPermissions={(id) => this.getGroupPermissions(id)}
        hasPermissionChecked={(p, id) => this.hasPermissionChecked(p, id)}
        toggleGroupPermission={(pG, gD) => this.toggleGroupPermission(pG, gD)}
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

export default composeWithTracker(composer, null)(SettingsContainer);
