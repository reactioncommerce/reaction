/**
 * @name getShippingRestrictionsCollection
 * @summary Get shipping restrictions collection from Mongo
 * @param {Object} context -  an object containing the per-request state
 * @returns {Object|null} shipping restriction collection for the provided fulfillment group
 */
export function getShippingRestrictionsCollection(context) {
  return context.app.db.collection("ShippingRestrictions");
}
