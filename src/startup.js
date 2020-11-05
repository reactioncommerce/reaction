import seedEmailTemplatesForShop from "./util/seedEmailTemplatesForShop.js";

/**
 * @name startup
 * @summary Called on startup
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function emailTemplatesStartup(context) {
  // Update templates if they don't already exist.
  const primaryShopId = await context.queries.primaryShopId(context.getInternalContext());
  if(primaryShopId) {
    await seedEmailTemplatesForShop(context, primaryShopId);
  }
}
