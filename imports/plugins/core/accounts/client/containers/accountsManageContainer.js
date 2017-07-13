import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Accounts, Groups, Packages } from "/lib/collections";
import { composeWithTracker } from "/lib/api/compose";
import AdminInviteForm from "../components/adminInviteForm";

class AccountsManageContainer extends Component {
  static propTypes = {
    groups: PropTypes.array,
    shopUsers: PropTypes.array
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
              permission: registryItem.name || pkg.name + "/" + registryItem.template,
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

  renderAddAdminForm() {
    return (
      <AdminInviteForm />
    );
  }

  render() {
    return (
      <div className="groups-form">
        {this.renderAddAdminForm()}
      </div>
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

export default composeWithTracker(composer, null)(AccountsManageContainer);
