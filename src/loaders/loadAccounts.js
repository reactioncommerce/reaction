import AccountData from "../json-data/Accounts.json";

const now = new Date();

/**
 * @summary load Accounts data
 * @param {Object} context - The application context
 * @returns {Promise<boolean>} true if success
 */
export default async function loadAccounts(context) {
  const { collections: { Accounts } } = context;
  AccountData.forEach((account) => {
    account.createdAt = now;
    account.updatedAt = now;
  });
  Accounts.insertMany(AccountData);
  return true;
}
