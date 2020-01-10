import Logger from "@reactioncommerce/logger";

/**
 * @name setRolesOnGroupAndUsers
 * @private
 * @summary Sets the given roles to the given group and updates users, if necessary
 * @param {Object} context App context
 * @param {Object} group - Group to update the roles of, and update users for
 * @param {String} group._id - Group's _id
 * @param {String} group.shopId - _id of shop group belongs to
 * @param {String} group.name - Name of group
 * @param {Array} roles - Array of roles/permissions (strings)
 * @returns {undefined} Nothing
 */
export default async function setRolesOnGroupAndUsers(context, { _id, shopId, name }, roles) {
  const { collections } = context;
  const { Accounts, Groups, users } = collections;

  await Groups.updateOne({
    _id
  }, {
    $set: {
      permissions: roles
    }
  });

  const maxAccountsPerUpdate = 100000;
  const accountSelector = { groups: _id };
  const numAccounts = await Accounts.find(accountSelector).count();
  if (numAccounts === 0) {
    Logger.debug("No users need roles updated");
    return;
  }

  Logger.debug(`Number of users to add roles to: ${numAccounts}`);
  const numQueriesNeeded = Math.ceil(numAccounts / maxAccountsPerUpdate);
  Logger.debug(`Number of updates needed: ${numQueriesNeeded}`);

  const accountOptions = {
    projection: { _id: 1 },
    sort: { _id: 1 },
    limit: maxAccountsPerUpdate
  };
  let lastUserIdUpdated = "";

  for (let inc = 0; inc < numQueriesNeeded; inc += 1) {
    Logger.debug(`Processing user role update #${inc + 1} of ${numQueriesNeeded} for ${name} group, ${roles} roles`);

    if (lastUserIdUpdated) {
      accountSelector._id = {
        $gt: lastUserIdUpdated
      };
    }

    const accounts = await Accounts.find(accountSelector, accountOptions).toArray(); // eslint-disable-line no-await-in-loop
    const userIds = accounts.map((account) => account._id);
    const firstUserIdInBatch = userIds[0];
    const lastUserIdInBatch = userIds[userIds.length - 1];
    const userSelector = { _id: { $gte: firstUserIdInBatch, $lte: lastUserIdInBatch } };
    const userModifier = {
      $set: {
        [`roles.${shopId}`]: roles
      }
    };

    await users.updateMany(userSelector, userModifier); // eslint-disable-line no-await-in-loop

    lastUserIdUpdated = lastUserIdInBatch;
  }

  Logger.debug(`setRolesOnGroupAndUsers completed for ${name} group, ${roles} roles`);
}
