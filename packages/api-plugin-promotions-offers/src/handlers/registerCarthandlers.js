import handleAfterCartUpdate from "./handleAfterCartUpdate.js";
import handleAfterCartCreate from "./handleAfterCartCreate.js";

/**
 * @summary handle cart events
 * @param {Object} context - The per request application context
 * @returns {undefined} undefined
 */
export default function registerCartHandlers(context) {
  const { appEvents } = context;
  appEvents.on("afterCartUpdate", ({ cart, updatedBy, emittedBy }) => handleAfterCartUpdate(context, { cart, updatedBy, emittedBy }));
  appEvents.on("afterCartCreate", ({ cart, updatedBy, emittedBy }) => handleAfterCartCreate(context, { cart, updatedBy, emittedBy }));
}
