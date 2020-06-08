import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name updateAdminUIAccess
 * @summary Grants admin UI access to a user
 * @param {Object} context - GraphQL execution context
 * @param {String} input Input of updateAdminUIAccess
 * @param {String} input.accountId Account ID to unassign the shop from
 * @param {String} input.shopId Shop ID to unassign from the account
 * @returns {Object} the up-to-date account object
 */
export default async function updateAdminUIAccess(context, input) {
  const { collections } = context;
  const { Accounts, Shops } = collections;

  const { accountIds, shopIds } = input;

  const accounts = await Accounts.find({
    _id: {
      $in: accountIds
    }
  }).toArray();

  if (!accounts) {
    throw new ReactionError("not-found", "No accounts matching the provided IDs were found");
  }

  if (accounts.length !== accountIds.length) {
    throw new ReactionError("not-found", `Could not find ${accountIds.length - accounts.length} of ${accountIds.length} accounts provided`);
  }

  await Promise.all(accounts.map((account) => context.validatePermissions(`reaction:plugin-admin-ui:admin-ui-access-permissions:${account._id}`, "update", {
    owner: account.userId
  })));

  const shops = await Shops.find({
    _id: {
      $in: shopIds
    }
  }).toArray();

  if (!shops) {
    throw new ReactionError("not-found", "No shops matching the provided IDs were found");
  }

  if (shops.length !== shopIds.length) {
    throw new ReactionError("not-found", `Could not find ${shopIds.length - shops.length} of ${shopIds.length} shops provided`);
  }

  await Accounts.updateMany({
    _id: {
      $in: accountIds
    }
  }, {
    $set: {
      adminUIShopIds: shopIds
    }
  });

  const updatedAccounts = accounts.map((account) => ({
    ...account,
    adminUIShopIds: shopIds
  }));

  return updatedAccounts;
}
