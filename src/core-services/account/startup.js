import ensureRoles from "./util/ensureRoles.js";
import {
  defaultCustomerRoles,
  defaultOwnerRoles,
  defaultShopManagerRoles,
  defaultVisitorRoles
} from "./util/defaultRoles.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function accountStartup(context) {
  // Add missing roles to `roles` collection if needed
  await ensureRoles(context, defaultCustomerRoles);
  await ensureRoles(context, defaultOwnerRoles);
  await ensureRoles(context, defaultShopManagerRoles);
  await ensureRoles(context, defaultVisitorRoles);
}
