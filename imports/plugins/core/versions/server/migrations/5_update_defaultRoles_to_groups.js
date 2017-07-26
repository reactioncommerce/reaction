import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Migrations } from "/imports/plugins/core/versions";
import { Logger } from "/server/api";
import { Accounts, Groups, Shops } from "/lib/collections";

Migrations.add({
  version: 5,
  up() {
    const shops = Shops.find({}).fetch();
    Groups.remove({});

    if (shops && shops.length) {
      shops.forEach((shop) => createGroupsForShop(shop));
    }

    function createGroupsForShop(shop) {
      const { defaultRoles, defaultVisitorRole } = shop;
      const roles = {
        customer: defaultRoles || [ "guest", "account/profile", "product", "tag", "index", "cart/checkout", "cart/completed"],
        guest: defaultVisitorRole || ["anonymous", "guest", "product", "tag", "index", "cart/checkout", "cart/completed"],
        owner: Roles.getAllRoles().fetch().map((role) => role.name)
      };

      Object.keys(roles).forEach((groupKeys) => {
        Logger.info(`creating group ${groupKeys} for shop ${shop.name}`);
        const groupId = Groups.insert({
          name: groupKeys,
          slug: groupKeys,
          permissions: roles[groupKeys],
          shopId: shop._id
        });
        Logger.info(`new group "${groupKeys}" created with id ${groupId}"`);
        return updateAccountsBelongingToGroup({ shopId: shop._id, permissions: roles[groupKeys], groupId });
      });
    }

    function updateAccountsBelongingToGroup({ shopId, permissions, groupId }) {
      const query = { [`roles.${shopId}`]: { $all: permissions } };
      const matchingUserIds = Meteor.users.find(query).fetch().map((user) => user._id);
      if (matchingUserIds.length) {
        Logger.info(`updating following matching Accounts to new group: ${matchingUserIds}`);
      }
      Accounts.update({ _id: { $in: matchingUserIds }, shopId }, { $addToSet: { groups: groupId } });
    }
  },
  down() {
    const shops = Shops.find({}).fetch();

    if (shops && shops.length) {
      shops.forEach((shop) => removeGroupsForShop(shop));
    }
    function removeGroupsForShop(shop) {
      const shopGroups = Groups.find({ shopId: shop._id }).fetch();

      const keys = {
        customer: "defaultRoles",
        guest: "defaultVisitorRole"
      };

      shopGroups.forEach((group) => {
        const shopkey = keys[group.slug];
        Shops.update({ _id: shop._id }, { $set: { [shopkey]: group.permissions } });
        Accounts.update({ shopId: shop._id }, { $unset: { groups: "" } });
      });
    }
  }
});
