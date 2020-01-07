import { extendInventorySchemas } from "../simpleSchemas.js";

/**
 * @summary Called pre startup
 * @param {Object} context Startup context
 * @param {Object} context.simpleSchemas Simple schemas
 * @returns {undefined}
 */
export default async function inventoryPreStartup(context) {
  extendInventorySchemas(context.simpleSchemas);
}
