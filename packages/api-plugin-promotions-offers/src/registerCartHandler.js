/**
 * @summary handle cart events
 * @param {Object} context - The per request application context
 * @returns {undefined} undefined
 */
export default function registerCartHandler(context) {
  const { appEvents, promotion } = context;

  promotion.registerProcessor('offers', (context) => {

  })
  appEvents.on("afterCartUpdate", ({ cart, updatedBy, emittedBy }) => handleAfterCartUpdate(context, { cart, updatedBy, emittedBy }));
  appEvents.on("afterCartCreate", ({ cart, updatedBy, emittedBy }) => handleAfterCartCreate(context, { cart, updatedBy, emittedBy }));
}
