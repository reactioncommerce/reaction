import Logger from "@reactioncommerce/logger";
import MigrationData from "../json-data/migrations.json";

/**
 * @summary load Migrations data
 * @param {Object} context - The application context
 * @returns {Promise<boolean>} true if success
 */
export default async function loadMigrations(context) {
  const collections = Object.keys(context.collections);
  Logger.info(collections);
  const { collections: { migrations } } = context;
  migrations.insertMany(MigrationData);
  return true;
}
