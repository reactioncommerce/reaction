import { extendTaxesSchemas } from "./simpleSchemas.js";

/**
 * @summary Called before startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function preStartup(context) {
  extendTaxesSchemas(context.simpleSchemas);
}
