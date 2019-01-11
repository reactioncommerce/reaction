/**
 * @name getSurchargesCollection
 * @summary Get surcharges collection from Mongo
 * @param {Object} context -  an object containing the per-request state
 * @returns {Object|null} surcharges collection
 */
export function getSurchargesCollection(context) {
  return context.app.db.collection("Surcharges");
}
