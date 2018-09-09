import appEvents from "/imports/plugins/core/core/server/appEvents";
import sendNewOrderNotifications from "./sendNewOrderNotifications";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections }) {
  appEvents.on("afterOrderCreate", (order) => sendNewOrderNotifications(collections, order));
}
