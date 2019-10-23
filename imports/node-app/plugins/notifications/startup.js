import sendCanceledOrderNotifications from "./util/sendCanceledOrderNotifications.js";
import sendNewOrderNotifications from "./util/sendNewOrderNotifications.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents } = context;

  appEvents.on("afterOrderCreate", ({ order }) => sendNewOrderNotifications(context, order));

  appEvents.on("afterOrderCancel", ({ order }) => sendCanceledOrderNotifications(context, order));
}
