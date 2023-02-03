import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

/**
 * @name filterAccounts
 * @method
 * @memberof GraphQL/Accounts
 * @summary Query the Accounts collection for a list of customers/accounts
 * @param {Object} context - an object containing the per-request state
 * @param {Object} conditions - object containing the filter conditions
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Accounts object Promise
 */
export default async function filterAccounts(context, conditions, shopId) {
  const { collections: { Accounts } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }
  await context.validatePermissions("reaction:legacy:accounts", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Account", conditions, shopId);

  return Accounts.find(filterQuery);
}
