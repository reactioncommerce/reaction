import ReactionError from "@reactioncommerce/reaction-error";
import { difference } from "lodash";
import SimpleSchema from "simpl-schema";
import ensureRoles from "../util/ensureRoles.js";

const inputSchema = new SimpleSchema({
  accountId: String,
  groupId: String
});

/**
 * @name accounts/addAccountToGroup
 * @memberof Mutations/Accounts
 * @method
 * @summary Add an account to a group
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments
 * @param {String} input.accountId - The account ID
 * @param {String} input.groupId - The group ID
 * @return {Promise<Object>} with updated address
 */
export default async function addAccountToGroup(context, input) {
  inputSchema.validate(input);

  const { accountId, groupId } = input;
  const {
    appEvents,
    collections: {
      Accounts,
      Groups,
      users
    },
    user
  } = context;

  const groupToMoveUserTo = await Groups.findOne({ _id: groupId });
  if (!groupToMoveUserTo) throw new ReactionError("not-found", "No group found with that ID");

  const { permissions: groupPermissions = [], shopId } = groupToMoveUserTo;

  // An account can add another account to a group as long as the person adding
  // has all permissions granted by that group.
  // We can't use `userHasPermission` here because we want to make sure they
  // have ALL the permissions rather than ANY.
  // Accounts in the "Owner" group are able to add any user to any group,
  // regardless of other permissions.
  const ownerGroup = await Groups.findOne({ name: "owner" });
  const contextUserAccount = await Accounts.findOne({ _id: user._id });
  const isOwnerAccount = !!ownerGroup && contextUserAccount.groups.includes(ownerGroup._id);

  if (!context.isInternalCall && !isOwnerAccount && difference(groupPermissions, user.roles[shopId] || []).length > 0) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "No account found with that ID");

  const accountUser = await users.findOne({ _id: account.userId });
  if (!accountUser) throw new ReactionError("not-found", "No user found with that ID");

  // Get a list of all the IDs of groups that belong to this shop
  const allGroupsInShop = await Groups.find({
    shopId
  }, {
    projection: {
      _id: 1
    }
  }).toArray();
  const allGroupIDsInShop = allGroupsInShop.map((grp) => grp._id);

  // Add all group roles to the user. Make sure this stays in this order.
  // Remove former group roles before adding new group roles, in case some are in both.
  const newAccountUserRoles = new Set(accountUser.roles[shopId] || []);

  const formerGroupId = (account.groups || []).find((grpId) => allGroupIDsInShop.indexOf(grpId) !== -1);
  if (formerGroupId) {
    const formerGroup = await Groups.findOne({
      _id: formerGroupId
    }, {
      projection: {
        permissions: 1
      }
    });
    if (formerGroup) {
      for (const formerRole of (formerGroup.permissions || [])) {
        newAccountUserRoles.delete(formerRole);
      }
    }
  }

  for (const newRole of groupPermissions) {
    newAccountUserRoles.add(newRole);
  }

  const newAccountUserRolesArray = [...newAccountUserRoles];
  await ensureRoles(context, newAccountUserRolesArray);
  await users.updateOne({
    _id: account.userId
  }, {
    $set: {
      [`roles.${shopId}`]: newAccountUserRolesArray
    }
  });

  // Save updated groups list, making sure user only belongs to one group per shop
  const newGroups = (account.groups || []).filter((grp) => allGroupIDsInShop.indexOf(grp) === -1);
  newGroups.push(groupId);
  await Accounts.updateOne({ _id: accountId }, { $set: { groups: newGroups } });

  const updatedAccount = {
    ...account,
    groups: newGroups
  };

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: user._id,
    updatedFields: ["groups"]
  });

  // Return the group the account was added to
  return Groups.findOne({ _id: groupId });
}
