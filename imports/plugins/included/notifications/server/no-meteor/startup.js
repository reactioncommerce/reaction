import appEvents from "/imports/node-app/core/util/appEvents";
import sendCanceledOrderNotifications from "./sendCanceledOrderNotifications";
import sendNewOrderNotifications from "./sendNewOrderNotifications";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections }) {
  appEvents.on("afterOrderCreate", ({ order }) => sendNewOrderNotifications(collections, order));

  appEvents.on("afterOrderCancel", ({ order }) => sendCanceledOrderNotifications(collections, order));
}
