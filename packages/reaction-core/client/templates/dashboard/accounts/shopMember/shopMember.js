
/**
* shopMember helpers
* permissions / roles controls
* we use userInRole instead of ReactionCore intentionally
* to check each users permissions
*/

Template.shopMember.helpers({
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
    ReactionCore.Collections.Packages.find({
      'shopId': Template.currentData()
    }).forEach(function(pkg) {
      var existing, label, permission, permissionMap, permissions, registryItem, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      permissions = [];
      permissionMap = {};
      if (pkg.enabled) {
        _ref = pkg.registry;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          registryItem = _ref[_i];
          if (!registryItem.route) {
            continue;
          }
          if (registryItem.permissions) {
            _ref1 = registryItem.permissions;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              permission = _ref1[_j];
              permission.shopId = Template.currentData();
              permissions.push(permission);
            }
          }
          for (_k = 0, _len2 = permissions.length; _k < _len2; _k++) {
            existing = permissions[_k];
            permissionMap[existing.permission] = existing.label;
          }
          if (!permissionMap[registryItem.route]) {
            permissions.push({
              shopId: pkg.shopId,
              permission: registryItem.route,
              label: registryItem.label || registryItem.provides || registryItem.route
            });
          }
        }
        label = pkg.name.replace('reaction', '').replace(/(-.)/g, function(x) {
          return " " + x[1].toUpperCase();
        });
        return permissionGroups.push({
          'shopId': pkg.shopId,
          'name': pkg.name,
          label: label,
          'permissions': _.uniq(permissions)
        });
      }
    });
    return permissionGroups;
  }
});

/**
 * shopMember events
 *
 */
Template.shopMember.events({
  "change .toggle-shop-member-permission": function(event, template) {
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
      Meteor.call("addUserPermissions", member.userId, permissions, this.shopId);
    } else {
      Meteor.call("removeUserPermissions", member.userId, permissions, this.shopId);
    }
  },
  "click .link-shop-member-remove": function(event, template) {
    var $icon, index, role, _ref, _results;
    $icon = $(event.currentTarget);
    if (confirm($icon.data("confirm"))) {
      _ref = template.data.roles;
      _results = [];
      for (role in _ref) {
        index = _ref[role];
        _results.push(Meteor.call("setUserPermissions", this.userId, ['guest', 'account/profile'], role));
      }
      return _results;
    }
  }
});
