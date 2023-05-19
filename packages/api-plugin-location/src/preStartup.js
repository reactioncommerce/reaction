import { Location } from "./simpleSchemas.js";

/**
 * @summary Called before startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function locationPreStartup(context) {
  const { simpleSchemas: { FulfillmentMethod } } = context;

  Location.extend({
    "fulfillmentMethods.$": {
      type: FulfillmentMethod
    }
  });
}
