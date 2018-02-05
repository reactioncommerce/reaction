import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Migrations } from "meteor/percolate:migrations";
import { Reaction, Logger } from "/server/api";
import { Accounts, Groups, Shops } from "/lib/collections";

/**
 * Migration file created for moving from previous admin permission management to permission groups
 * On up, it creates the default groups for all shops in the app, then update accounts belonging to the
 * default groups. It also creates custom groups for every unique set of permission and assigns accounts
 * with such permissions to the custom group they belong.
 */
Migrations.add({
  version: 5,
  up() {
    const shops = Shops.find({}).fetch();

    // needed to ensure restart in case of a migration that failed before finishing
    Groups.remove({});
    Accounts.update({}, { $set: { groups: [] } }, { bypassCollection2: true, multi: true });

    if (shops && shops.length) {
      shops.forEach((shop) => {
        const defaultGroupAccounts = createDefaultGroupsForShop(shop);
        // retrieves remaining permission sets that doesn't fit the default sets
        const customPermissions = Meteor.users
          .find({ _id: { $nin: defaultGroupAccounts } })
          .fetch()
          .map((user) => user.roles && user.roles[shop._id]);
        // sorts the array of permission sets to contain only unique sets to avoid creating groups with same permissions
        const permissionsArray = sortUniqueArray(customPermissions);
        permissionsArray.forEach((permissions, index) => {
          if (!permissions) { return null; }
          Logger.debug(`creating custom group for shop ${shop.name}`);
          const groupId = Groups.insert({
            name: `custom ${index + 1}`,
            slug: `custom${index + 1}`,
            permissions,
            shopId: shop._id
          }, { bypassCollection2: true });
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
      let ownerRoles = Roles.getAllRoles().fetch().map((role) => role.name);

      // See detailed comment in `/server/api/core/groups.js`. The code here follows similar pattern.
      ownerRoles = ownerRoles.concat(Reaction.defaultCustomerRoles);
      ownerRoles = _.uniq(ownerRoles);

      const shopManagerRoles = ownerRoles.filter((role) => role !== "owner");
      const roles = {
        "shop manager": shopManagerRoles,
        "customer": defaultRoles || Reaction.defaultCustomerRoles,
        "guest": defaultVisitorRole || Reaction.defaultVisitorRoles,
        "owner": ownerRoles
      };

      Object.keys(roles).forEach((groupKeys) => {
        Logger.debug(`creating group ${groupKeys} for shop ${shop.name}`);
        const groupId = Groups.insert({
          name: groupKeys,
          slug: groupKeys,
          permissions: roles[groupKeys],
          shopId: shop._id
        });
        Logger.debug(`new group "${groupKeys}" created with id "${groupId}"`);
        const updatedAccounts = updateAccountsInGroup({
          shopId: shop._id,
          permissions: roles[groupKeys],
          groupId
        });
        defaultGroupAccounts = defaultGroupAccounts.concat(updatedAccounts);
      });
      return defaultGroupAccounts;
    }

    // finds all accounts with a permission set and assigns them to matching group
    function updateAccountsInGroup({ shopId, permissions = [], groupId }) {
      const query = { [`roles.${shopId}`]: { $size: permissions.length, $all: permissions } };
      const matchingUserIds = Meteor.users.find(query).fetch().map((user) => user._id);

      if (matchingUserIds.length) {
        Logger.debug(`updating following matching Accounts to new group: ${matchingUserIds}`);
      }
      Accounts.update(
        { _id: { $in: matchingUserIds }, shopId },
        { $addToSet: { groups: groupId } },
        { bypassCollection2: true, multi: true }
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
        Accounts.update({ shopId: shop._id }, { $unset: { groups: "" } }, { bypassCollection2: true, multi: true });
      });
    }
  }
});

/*
 * helper func created to limit the permission sets available to unique values without duplicates.
 * It takes a two dimentional array like this:
 * [
 *   ["tag", "product"],
 *   ["product", "tag"],
 *   ["tag", "product", "shop"],
 *   ["tag", "shop"],
 *   ["shop", "tag"]
 * ]
 * and returns this: [["product", "tag"], ["product", "shop", "tag"], ["shop", "tag"]]
 */
function sortUniqueArray(multiArray) {
  const sorted = multiArray.map((x) => {
    if (!x) { return []; }
    return x.sort();
  }).sort();
  const uniqueArray = [];
  uniqueArray.push(sorted[0]);

  for (let i = 1; i < sorted.length; i += 1) {
    if (JSON.stringify(sorted[i]) !== JSON.stringify(sorted[i - 1])) {
      uniqueArray.push(sorted[i]);
    }
  }
  return uniqueArray;
}
