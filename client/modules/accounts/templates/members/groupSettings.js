import _ from "lodash";
import { Reaction } from "/client/api";
import { Packages } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

const getPermissionMap = (permissions) => {
  const permissionMap = {};
  _.each(permissions, function (existing) {
    permissionMap[existing.permission] = existing.label;
  });
  return permissionMap;
};

Template.groupSettings.helpers({
  hasManyPermissions: function (permissions) {
    return Boolean(permissions.length);
  },
  userId: function () {
    return Meteor.userId();
  },
  hasPermissionChecked: function (permission) {
    const { permissions } = Template.instance().data;

    if ((permissions || []).indexOf(permission) > -1) {
      return "checked";
    }
  },
  permissionGroups: function () {
    console.log("starting.....");
    const permissionGroups = [];

    const packages = Packages.find({
      shopId: Reaction.getShopId()
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
                permission.shopId = Reaction.getShopId();
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
});

Template.groupSettings.events({
  "change [data-event-action=toggleGroupPermission]": function (event, template) {
    const self = this;
    const permissions = [];
    const currentData = template.data;

    if (!this.shopId) {
      throw new Meteor.Error("Shop is required");
    }
    if (self.name) {
      permissions.push(self.name);
      for (const pkgPermissions of self.permissions) {
        permissions.push(pkgPermissions.permission);
      }
    } else {
      permissions.push(self.permission);
    }

    const update = Object.assign({}, currentData, { permissions: permissions.concat(currentData.permissions) });

    if (Template.instance().$(event.currentTarget).is(":checked")) {
      Meteor.call("group/updateGroup", currentData, update, Reaction.getShopId());
    } else {
      // Meteor.call("accounts/removeUserPermissions", member.userId, permissions, this.shopId);
    }
  }
});
