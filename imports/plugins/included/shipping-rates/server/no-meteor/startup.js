import collectionIndex from "/imports/utils/collectionIndex";
/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  context.collections.FlatRateFulfillmentRestrictions = context.app.db.collection("FlatRateFulfillmentRestrictions");
  collectionIndex(context.collections.FlatRateFulfillmentRestrictions, { methodIds: 1 });
}
