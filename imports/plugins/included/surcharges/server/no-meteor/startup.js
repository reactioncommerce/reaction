/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  context.collections.FlatRateFulfillmentSurcharges = context.app.db.collection("FlatRateFulfillmentSurcharges");
}
