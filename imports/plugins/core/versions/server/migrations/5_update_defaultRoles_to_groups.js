/* eslint-disable require-jsdoc */
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";
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
        // eslint-disable-next-line consistent-return
        permissionsArray.forEach((permissions, index) => {
          if (!permissions) { return null; }
          Logger.debug(`creating custom group for shop ${shop.name}`);
          // An "update" is preferred here to cover cases where a migration re-run is triggered (and thus avoids duplicates).
          // (as against deleting all the documents before a re-run).
          const groupId = Groups.update({
            slug: `custom${index + 1}`
          }, {
            name: `custom ${index + 1}`,
            slug: `custom${index + 1}`,
            permissions,
            shopId: shop._id
          }, {
            upsert: true,
            bypassCollection2: true
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
      const groupNames = ["shop manager", "customer", "guest", "owner"];

      groupNames.forEach((groupKeys) => {
        Logger.debug(`creating group ${groupKeys} for shop ${shop.name}`);
        // On startup Reaction.init() creates the default groups, this finds existing groups
        // and updates accounts that belong to them
        const { _id, permissions } = Groups.findOne({ slug: groupKeys }) || {};
        Logger.debug(`new group "${groupKeys}" created with ID "${_id}"`);
        const updatedAccounts = updateAccountsInGroup({
          shopId: shop._id,
          permissions,
          _id
        });
        defaultGroupAccounts = defaultGroupAccounts.concat(updatedAccounts);
      });
      return defaultGroupAccounts;
    }

    // finds all accounts with a permission set and assigns them to matching group
    function updateAccountsInGroup({ shopId, permissions = [], groupId }) {
      if (!groupId) return [];
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
 * It takes a two dimensional array like this:
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
  const sorted = multiArray.map((array) => {
    if (!array) { return []; }
    return array.sort();
  }).sort();
  const uniqueArray = [];
  uniqueArray.push(sorted[0]);

  for (let inc = 1; inc < sorted.length; inc += 1) {
    if (JSON.stringify(sorted[inc]) !== JSON.stringify(sorted[inc - 1])) {
      uniqueArray.push(sorted[inc]);
    }
  }
  return uniqueArray;
}
