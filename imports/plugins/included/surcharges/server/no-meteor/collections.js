/**
 * @name getSurchargesCollection
 * @summary Get shipping surcharges collection from Mongo
 * @param {Object} context -  an object containing the per-request state
 * @returns {Object|null} shipping surcharges collection for the provided fulfillment group
 */
export function getSurchargesCollection(context) {
  return context.app.db.collection("Surcharges");
}
