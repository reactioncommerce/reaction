import { registerFunction } from "/imports/core-server";
import shippingRatesStartup from "/imports/plugins/included/shipping-rates/server/no-meteor/startup";
import shippingStartup from "/imports/plugins/core/shipping/server/no-meteor/startup";
import searchStartup from "/imports/plugins/included/search-mongo/server/no-meteor/startup";

/**
 * @param {Object} context Context object with appEvents and collections
 * @returns {undefined}
 */
export default function runPluginStartup(context) {
  const expandedContext = {
    ...context,
    registerFunction
  };
  searchStartup(expandedContext);
  shippingRatesStartup(expandedContext);
  shippingStartup(expandedContext);
}
