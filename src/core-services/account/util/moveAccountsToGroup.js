import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import canAddAccountToGroup from "./canAddAccountToGroup.js";

/**
 * @name moveAccountsToGroup
 * @private
 * @summary Move all accounts from a specified group to another group.
 * @param {Object} context App context
 * @param {String} input.shopId - Shop to perform the move within. Both groups must be on the same shop.
 * @param {String} input.fromGroupId - Group to move accounts from
 * @param {String} input.toGroupId - Group to move accounts to
 * @returns {undefined} Nothing
 */
export default async function moveAccountsToGroup(context, { shopId, fromGroupId, toGroupId }) {
  const { collections } = context;
  const { Accounts, Groups, users } = collections;

  const toGroup = await Groups.findOne({ _id: toGroupId, shopId });

  if (!toGroup) {
    throw new ReactionError("not-found", `Accounts cannot be moved to group with ID ${toGroupId}. Group doesn't exist.`);
  }

  const isAllowed = await canAddAccountToGroup(context, toGroup);
  if (!isAllowed) throw new ReactionError("access-denied", "Access Denied");

  const roles = toGroup.permissions;
  const maxAccountsPerUpdate = 100000;
  const accountSelector = { groups: fromGroupId };
  const numAccounts = await Accounts.find(accountSelector).count();
  if (numAccounts === 0) {
    Logger.debug(`No users need to be moved from group ${fromGroupId}`);
    return;
  }

  Logger.debug(`Number of users to move: ${numAccounts}`);
  const numQueriesNeeded = Math.ceil(numAccounts / maxAccountsPerUpdate);
  Logger.debug(`Number of updates needed: ${numQueriesNeeded}`);

  const accountOptions = {
    projection: { _id: 1 },
    sort: { _id: 1 },
    limit: maxAccountsPerUpdate
  };
  let lastUserIdUpdated = "";

  for (let inc = 0; inc < numQueriesNeeded; inc += 1) {
    Logger.debug(`Processing account group move #${inc + 1} of ${numQueriesNeeded} for ${name} group, ${roles} roles`);

    if (lastUserIdUpdated) {
      accountSelector._id = {
        $gt: lastUserIdUpdated
      };
    }

    const accounts = await Accounts.find(accountSelector, accountOptions).toArray(); // eslint-disable-line no-await-in-loop
    const userIds = accounts.map((account) => account._id);
    const firstUserIdInBatch = userIds[0];
    const lastUserIdInBatch = userIds[userIds.length - 1];
    const accountUpdateSelector = { _id: { $gte: firstUserIdInBatch, $lte: lastUserIdInBatch } };
    const userSelector = { _id: { $gte: firstUserIdInBatch, $lte: lastUserIdInBatch } };
    const accountModifier = {
      $set: {
        groups: toGroupId
      }
    };
    const userModifier = {
      $set: {
        [`roles.${shopId}`]: roles
      }
    };

    await Accounts.updateMany(accountUpdateSelector, accountModifier); // eslint-disable-line no-await-in-loop
    await users.updateMany(userSelector, userModifier); // eslint-disable-line no-await-in-loop

    lastUserIdUpdated = lastUserIdInBatch;
  }

  Logger.debug(`moveAccountsToGroup completed for ${name} group, ${roles} roles`);
}
