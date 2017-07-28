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
      shops.forEach((shop) => {
        const defaultGroupAccounts = createDefaultGroupsForShop(shop);

        const customPermissions = Meteor.users
          .find({ _id: { $nin: defaultGroupAccounts } })
          .fetch()
          .map(user => user.roles[shop._id]);

        const permissionsArray = sortUniqueArray(customPermissions);

        permissionsArray.forEach((permissions, index) => {
          Logger.info(`creating custom group for shop ${shop.name}`);
          const groupId = Groups.insert({
            name: `custom ${index + 1}`,
            slug: `custom${index + 1}`,
            permissions,
            shopId: shop._id
          });
          updateAccountsInGroup({
            shopId: shop._id,
            permissions,
            groupId
          });
        });
      });
    }

    function createDefaultGroupsForShop(shop) {
      let defaultGroupAccounts = [];
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
        Logger.info(`new group "${groupKeys}" created with id "${groupId}"`);
        const updatedAccounts = updateAccountsInGroup({
          shopId: shop._id,
          permissions: roles[groupKeys],
          groupId
        });
        defaultGroupAccounts = defaultGroupAccounts.concat(updatedAccounts);
      });
      return defaultGroupAccounts;
    }

    function updateAccountsInGroup({ shopId, permissions, groupId }) {
      const query = { [`roles.${shopId}`]: { $size: permissions.length, $all: permissions } };
      const matchingUserIds = Meteor.users.find(query).fetch().map((user) => user._id);

      if (matchingUserIds.length) {
        Logger.info(`updating following matching Accounts to new group: ${matchingUserIds}`);
      }
      Accounts.update(
        { _id: { $in: matchingUserIds }, shopId },
        { $addToSet: { groups: groupId } },
        { multi: true }
      );
      return matchingUserIds;
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

function sortUniqueArray(multiArray) {
  const sorted = multiArray.map(x => {
    if (!x) { return []; }
    return x.sort();
  }).sort();
  const uniqueArray = [];
  uniqueArray.push(sorted[0]);

  for (let i = 1; i < sorted.length; i++) {
    if (JSON.stringify(sorted[i]) !== JSON.stringify(sorted[i - 1])) {
      uniqueArray.push(sorted[i]);
    }
  }
  return uniqueArray;
}
