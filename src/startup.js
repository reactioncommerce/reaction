import Logger from "@reactioncommerce/logger";
import loadShops from "./loaders/loadShops.js";
import loadAccounts from "./loaders/loadAccounts.js";
import loadGroups from "./loaders/loadGroups.js";
import loadRoles from "./loaders/loadRoles.js";
import loadUsers from "./loaders/loadUsers.js";
import loadProducts from "./loaders/loadProducts.js";
import loadMediaFileRecord from "./loaders/loadImages/loadMediaFileRecord.js";
import uploadFile from "./loaders/loadImages/uploadFile.js";

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
  Logger.info("Load Accounts");
  await loadAccounts(context);
  Logger.info("Load Groups");
  await loadGroups(context);
  // await loadMigrations(context);
  Logger.info("Load Roles");
  await loadRoles(context);
  Logger.info("Load Shops");
  await loadShops(context);
  Logger.info("Load Users");
  await loadUsers(context);
  Logger.info("Load Products");
  await loadProducts(context);
  Logger.info("Load MediaFileRecord");
  await loadMediaFileRecord(context);
  await uploadFile(context);
  // all other load scripts go here
  Logger.info("Loading Sample Data complete");
  return true;
}
