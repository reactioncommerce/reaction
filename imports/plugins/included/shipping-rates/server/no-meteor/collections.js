/**
 * @name getFlatRateFulfillmentRestrictionsCollection
 * @summary Get shipping restrictions collection from Mongo
 * @param {Object} context -  an object containing the per-request state
 * @returns {Object|null} shipping restriction collection for the provided fulfillment group
 */
export function getFlatRateFulfillmentRestrictionsCollection(context) {
  return context.app.db.collection("FlatRateFulfillmentRestrictions");
}
