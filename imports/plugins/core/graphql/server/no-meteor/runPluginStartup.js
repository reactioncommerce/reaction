import { getRegisteredFunctionsForType, registerFunction } from "/imports/node-app/core/util/registerFunction";
import fulfillmentService from "/imports/node-app/services/fulfillment";

/**
 * @param {Object} context Context object with appEvents and collections
 * @returns {undefined}
 */
export default async function runPluginStartup(context) {
  const expandedContext = {
    ...context,
    getRegisteredFunctionsForType,
    registerFunction
  };

  await fulfillmentService.startup(expandedContext);
}
