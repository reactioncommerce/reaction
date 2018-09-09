import { registerFunction } from "/imports/core-server";
import cartStartup from "/imports/plugins/core/cart/server/no-meteor/startup";
import discountsStartup from "/imports/plugins/core/discounts/server/no-meteor/startup";
import discountCodesStartup from "/imports/plugins/included/discount-codes/server/no-meteor/startup";
import shippingStartup from "/imports/plugins/core/shipping/server/no-meteor/startup";
import notificationsStartup from "/imports/plugins/included/notifications/server/no-meteor/startup";
import searchStartup from "/imports/plugins/included/search-mongo/server/no-meteor/startup";
import shippingRatesStartup from "/imports/plugins/included/shipping-rates/server/no-meteor/startup";

/**
 * @param {Object} context Context object with appEvents and collections
 * @returns {undefined}
 */
export default function runPluginStartup(context) {
  const expandedContext = {
    ...context,
    registerFunction
  };

  cartStartup(expandedContext);
  discountsStartup(expandedContext);
  discountCodesStartup(expandedContext);
  notificationsStartup(expandedContext);
  searchStartup(expandedContext);
  shippingRatesStartup(expandedContext);
  shippingStartup(expandedContext);
}
