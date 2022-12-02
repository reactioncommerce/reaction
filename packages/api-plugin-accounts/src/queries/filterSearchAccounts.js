import generateFilterQuery from "@reactioncommerce/api-utils/lib/generateFilterQuery.js";

/**
 * @name filterSearchAccounts
 * @method
 * @memberof GraphQL/Accounts
 * @summary Query the Accounts collection for a list of customers/accounts
 * @param {Object} context - an object containing the per-request state
 * @param {Object} filter1level - an object containing ONE level of filters to apply
 * @param {Object} filter2level - an object containing TWO levels of filters to apply
 * @param {Object} filter3level - an object containing THREE levels of filters to apply
 * @param {String} level - number of levels used in filter object
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Accounts object Promise
 */
export default async function filterSearchAccounts(context, filter1level, filter2level, filter3level, level, shopId) {
  const { collections: { Accounts } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }
  await context.validatePermissions("reaction:legacy:accounts", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Account", filter1level, filter2level, filter3level, level, shopId);

  return Accounts.find(filterQuery);
}
