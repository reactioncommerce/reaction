/**
* shopMember helpers
* permissions / roles controls
* we use userInRole instead of ReactionCore intentionally
* to check each users permissions
*/
Template.member.events({
  "click [data-event-action=showMemberSettings]": function () {
    ReactionCore.showActionView({
      label: "Edit Member",
      data: this,
      template: "memberSettings"
    });
  }
});








Template.memberSettings.helpers({
  isOwnerDisabled: function(userId) {
    if (Meteor.userId() === this.userId) {
      if (Roles.userIsInRole(this.userId, 'owner', this.shopId)) {
        return true;
      }
    }
  },
  hasPermissionChecked: function(permission, userId) {
    if (userId && (Roles.userIsInRole(userId, permission, this.shopId || Roles.userIsInRole(userId, permission, Roles.GLOBAL_GROUP)))) {
      return "checked";
    }
  },
  groupsForUser: function(userId) {
    userId = userId || this.userId || Template.parentData(1).userId;
    return Roles.getGroupsForUser(userId);
  },
  shopLabel: function(shopId) {
    var _ref;
    return (_ref = ReactionCore.Collections.Shops.findOne({
      '_id': Template.currentData()
    })) != null ? _ref.name : void 0;
  },
  permissionGroups: function(shopId) {
    var permissionGroups;
    permissionGroups = [];

    var shopId = Template.currentData();

    var packages = ReactionCore.Collections.Packages.find({
      'shopId': shopId
    });

    packages.forEach(function (package) {
      var permissions = [];
      var permissionMap = {};

      if (package.enabled) {

        for (var i = 0; i < package.registry.length; i++) {
          var registryItem = package.registry[i];

          // Skip entires with missing routes
          if (!registryItem.route) {
            continue;
          }

          // Get all permissions, add them to an array
          if (registryItem.permissions) {
            _.each(registryItem.permissions, function (permission) {
              permission.shopId = shopId;
              permissions.push(permission);
            });
          }

          // Also create an object map of those same permissions as above
          _.each(permissions, function (existing) {
            permissionMap[existing.permission] = existing.label;
          });


          if (!permissionMap[registryItem.route]) {
            permissions.push({
              shopId: package.shopId,
              permission: registryItem.route,
              icon: registryItem.icon,
              label: registryItem.label || registryItem.provides || registryItem.route
            });
          }
        }

        var label = package.name.replace('reaction', '').replace(/(-.)/g, function(x) {
          return " " + x[1].toUpperCase();
        });

        return permissionGroups.push({
          shopId: package.shopId,
          icon: package.icon,
          name: package.name,
          label: label,
          permissions: _.uniq(permissions)
        });
      }
    });

    return permissionGroups;
  },

  hasManyPermissions: function (permissions) {
    return permissions.length > 1;
  }
});

/**
 * shopMember events
 *
 */
Template.memberSettings.events({
  "change [data-event-action=toggleMemberPermission]": function(event, template) {
    var member, permissions, pkgPermissions, self, _i, _len, _ref;
    self = this;
    permissions = [];
    member = template.data;
    if (!this.shopId) {
      throw new Meteor.Error("Shop is required");
    }
    if (self.name) {
      permissions.push(self.name);
      _ref = self.permissions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pkgPermissions = _ref[_i];
        permissions.push(pkgPermissions.permission);
      }
    } else {
      permissions.push(self.permission);
    }
    if ($(event.currentTarget).is(':checked')) {
      Meteor.call("accounts/addUserPermissions", member.userId, permissions, this.shopId);
    } else {
      Meteor.call("accounts/removeUserPermissions", member.userId, permissions, this.shopId);
    }
  },
  "click [data-event-action=resetMemberPermission]": function(event, template) {
    var $icon, index, role, _ref, _results;
    $icon = $(event.currentTarget);
    if (confirm($icon.data("confirm"))) {
      _ref = template.data.roles;
      _results = [];
      for (role in _ref) {
        index = _ref[role];
        _results.push(Meteor.call("accounts/setUserPermissions", this.userId, ['guest', 'account/profile'], role));
      }
      return _results;
    }
  }
});
