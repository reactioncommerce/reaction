import { registerFunction } from "/imports/core-server";
import { startup as shippingServiceStartup } from "/imports/services/fulfillment";

/**
 * @param {Object} context Context object with appEvents and collections
 * @returns {undefined}
 */
export default function runPluginStartup(context) {
  const expandedContext = {
    ...context,
    registerFunction
  };
  shippingServiceStartup(expandedContext);
}
