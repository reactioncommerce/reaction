import { getRegisteredFunctionsForType, registerFunction } from "/imports/node-app/core/util/registerFunction";
import fulfillmentService from "/imports/node-app/services/fulfillment";
import cartStartup from "/imports/plugins/core/cart/server/no-meteor/startup";
import discountsStartup from "/imports/plugins/core/discounts/server/no-meteor/startup";
import discountCodesStartup from "/imports/plugins/included/discount-codes/server/no-meteor/startup";
import notificationsStartup from "/imports/plugins/included/notifications/server/no-meteor/startup";
import searchStartup from "/imports/plugins/included/search-mongo/server/no-meteor/startup";

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

  await Promise.all([
    cartStartup(expandedContext),
    discountsStartup(expandedContext),
    discountCodesStartup(expandedContext),
    notificationsStartup(expandedContext),
    searchStartup(expandedContext),
    fulfillmentService.startup(expandedContext)
  ]);
}
