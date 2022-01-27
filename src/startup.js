import Logger from "@reactioncommerce/logger";
import loadShops from "./loaders/loadShops.js";
import loadAccounts from "./loaders/loadAccounts.js";
import loadGroups from "./loaders/loadGroups.js";
import loadMigrations from "./loaders/loadMigrations.js";
import loadRoles from "./loaders/loadRoles.js";
import loadUsers from "./loaders/loadUsers.js";

/**
 * @summary run all data loader functions
 * @param {Object} context - the application context
 * @returns {Promise<Boolean>} true if success
 */
export default async function loadSampleData(context) {
  Logger.info("Beginning load Sample Data");
  const { collections: { Shops } } = context;
  const shopExists = await Shops.findOne();
  if (shopExists) {
    Logger.warn("Not loading sample data because data already exists");
    return false;
  }
  await loadAccounts(context);
  await loadGroups(context);
  // await loadMigrations(context);
  await loadRoles(context);
  await loadShops(context);
  await loadUsers(context);
  // all other load scripts go here
  Logger.info("Loading Sample Data complete");
  return true;
}
