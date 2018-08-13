import shippingStartup from "/imports/plugins/core/shipping/server/no-meteor/startup";

/**
 * @param {Object} context Context object with appEvents and collections
 * @returns {undefined}
 */
export default function runPluginStartup(context) {
  shippingStartup(context);
}
