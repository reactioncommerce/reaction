import { extendFulfillmentSchemas } from "./simpleSchemas.js";

/**
 * @summary Called before startup to extend schemas
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function fulfillmentPreStartup(context) {
  const allFulfillmentTypesArray = context.fulfillment?.registeredFulfillmentTypes;
  extendFulfillmentSchemas(context.simpleSchemas, allFulfillmentTypesArray);
}
