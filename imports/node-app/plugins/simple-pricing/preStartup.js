import { extendSchemas } from "./simpleSchemas.js";

/**
 * @method preStartup
 * @summary Simple pricing preStartup function.
 * @param {Object} context - App context.
 * @returns {undefined} - void, no return.
 */
export default async function preStartup(context) {
  extendSchemas(context.simpleSchemas);
}
