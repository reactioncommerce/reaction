import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

/**
 * @name filterCustomers
 * @method
 * @memberof GraphQL/Customers
 * @summary Query the Accounts collection for a list of customers/accounts
 * @param {Object} context - an object containing the per-request state
 * @param {Object} conditions - object containing the filter conditions
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Accounts object Promise
 */
export default async function filterCustomers(context, conditions, shopId) {
  const { collections: { Accounts } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }
  await context.validatePermissions("reaction:legacy:accounts", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Account", conditions, shopId);

  filterQuery.groups = { $in: [null, []] }; // filter out non-customer accounts
  return Accounts.find(filterQuery);
}
