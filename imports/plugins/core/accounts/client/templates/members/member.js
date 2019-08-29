import _ from "lodash";
import { Reaction } from "/client/api";
import { Packages, Shops } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Roles } from "meteor/alanning:roles";
import ReactionError from "@reactioncommerce/reaction-error";
import AccountsDashboard from "/imports/plugins/core/accounts/client/containers/accountsDashboardContainer";
import { Components } from "@reactioncommerce/reaction-components";

const getPermissionMap = (permissions) => {
  const permissionMap = {};
  _.each(permissions, (existing) => {
    permissionMap[existing.permission] = existing.label;
  });
  return permissionMap;
};

/**
 * shopMember helpers
 * permissions / roles controls
 * we use userInRole instead of Reaction intentionally
 * to check each users permissions
 */
Template.member.events({
  "click [data-event-action=showMemberSettings]"() {
    $(".customerUsageType input").val(""); // form reset
    $(".customerUsageType").addClass("hide"); // form reset
    Reaction.setActionViewDetail({
      label: "Permissions",
      i18nKeyLabel: "admin.settings.permissionsSettingsLabel",
      data: this,
      template: "memberSettings"
    });
  }
});

Template.memberSettings.helpers({
  isOwnerDisabled() {
    if (Reaction.getUserId() === this.userId) {
      if (Roles.userIsInRole(this.userId, "owner", this.shopId)) {
        return true;
      }
    }

    return false;
  },
  userId() {
    return Reaction.getUserId();
  },
  hasPermissionChecked(permission, userId) {
    if (userId && Roles.userIsInRole(userId, permission, this.shopId || Roles.userIsInRole(
      userId, permission,
      Roles.GLOBAL_GROUP
    ))) {
      return "checked";
    }

    return null;
  },
  groupsForUser(groupUserId) {
    const userId = groupUserId || this.userId || Template.parentData(1).userId;
    return Roles.getGroupsForUser(userId);
  },
  shopLabel(thisShopId) {
    const shopId = thisShopId || Template.currentData();
    const shop = Shops.findOne({
      _id: shopId
    });
    if (shop && shop.name) {
      return shop.name || "Default Shop";
    }

    return null;
  },
  permissionGroups(thisShopId) {
    const permissionGroups = [];
    const shopId = thisShopId || Template.currentData();
    const packages = Packages.find({
      shopId
    });

    packages.forEach((pkg) => {
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
              permission: registryItem.name || `${pkg.name}/${registryItem.template}`, // launchdock-connect/connectDashboard
              icon: registryItem.icon,
              label: registryItem.label || registryItem.provides || registryItem.route
            });
          }
        }
        // TODO review this, hardcoded WIP
        const label = pkg.name.replace("reaction", "").replace(/(-.)/g, (string) => ` ${string[1].toUpperCase()}`);

        return permissionGroups.push({
          shopId: pkg.shopId,
          icon: pkg.icon,
          name: pkg.name,
          label,
          permissions: _.uniq(permissions)
        });
      }

      return null;
    });

    return permissionGroups;
  },

  hasManyPermissions(permissions) {
    return Boolean(permissions.length);
  },

  /**
   * showAvalaraTaxSettings
   * @returns {Boolean} True if avalara is enabled. Defaults to false if not found
   * @ignore
   */
  showAvalaraTaxSettings() {
    const avalara = Packages.findOne({
      name: "taxes-avalara",
      shopId: Reaction.getShopId()
    });

    return _.get(avalara, "settings.avalara.enabled", false);
  },

  accountsDetail() {
    return {
      component: AccountsDashboard
    };
  },

  ReactionAvatar() {
    return {
      component: Components.ReactionAvatar
    };
  }
});

/**
 * shopMember events
 *
 */
Template.memberSettings.events({
  "change [data-event-action=toggleMemberPermission]"(event, template) {
    const self = this;
    const permissions = [];
    const member = template.data;
    if (!this.shopId) {
      throw new ReactionError("invalid-parameter", "Shop is required");
    }
    if (self.name) {
      permissions.push(self.name);
      for (const pkgPermissions of self.permissions) {
        permissions.push(pkgPermissions.permission);
      }
    } else {
      permissions.push(self.permission);
    }
    if (Template.instance().$(event.currentTarget).is(":checked")) {
      Meteor.call("accounts/addUserPermissions", member.userId, permissions, this.shopId);
    } else {
      Meteor.call("accounts/removeUserPermissions", member.userId, permissions, this.shopId);
    }
  },
  "click [data-event-action=resetMemberPermission]"(event, template) {
    const $icon = Template.instance().$(event.currentTarget);
    if (confirm($icon.data("confirm"))) { // eslint-disable-line no-alert
      const results = [];
      for (const role of template.data.roles) {
        results.push(Meteor.call("accounts/setUserPermissions", this.userId, ["guest", "account/profile"], role));
      }
      return results;
    }

    return null;
  }
});
