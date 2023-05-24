import AccountData from "../json-data/Accounts.json" assert { type: "json" };

/**
 * @summary load Accounts data
 * @param {Object} context - The application context
 * @returns {Object} Accounts data
 */
export default async function loadAccounts(context) {
  const account = await context.mutations.createAccount(context.getInternalContext(), AccountData);
  return account;
}
