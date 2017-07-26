import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Migrations } from "/imports/plugins/core/versions";
import { Logger } from "/server/api";
import { Accounts, Groups, Shops } from "/lib/collections";

Migrations.add({
  version: 5,
  up() {
    const allGroups = Groups.find({}).fetch();
    const shops = Shops.find({}).fetch();

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
        const groupExists = allGroups.find((grp) => grp.slug === groupKeys && grp.shopId === shop._id);
        if (!groupExists) {
          Logger.debug(`creating group ${groupKeys} for shop ${shop.name}`);
          const groupId = Groups.insert({
            name: groupKeys,
            slug: groupKeys,
            permissions: roles[groupKeys],
            shopId: shop._id
          });
          console.log({ newgroup: groupId });
          updateAccountsBelongingToGroup({ shopId: shop._id, permissions: roles[groupKeys], groupId });
        }
      });
    }

    function updateAccountsBelongingToGroup({ shopId, permissions, groupId }) {
      const query = { [`roles.${shopId}`]: permissions };
      const matchingUserIds = Meteor.users.find(query).fetch().map((user) => user._id);
      Accounts.update({ _id: { $in: matchingUserIds } }, { $set: { groups: [groupId] } });
    }
  },
  down() {

  }
});
