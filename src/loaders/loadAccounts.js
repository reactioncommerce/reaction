import AccountData from "../json-data/Accounts.json";

const now = new Date();

/**
 * @summary load Accounts data
 * @param {Object} context - The application context
 * @returns {Object} Accounts data
 */
export default async function loadAccounts(context) {
  let account = await context.mutations.createAccount(context.getInternalContext(), AccountData);
  return account;
}
