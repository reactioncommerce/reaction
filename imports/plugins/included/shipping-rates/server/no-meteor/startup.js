import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  context.collections.FlatRateFulfillmentRestrictions = context.app.db.collection("FlatRateFulfillmentRestrictions");
  context.collections.Shipping = context.app.db.collection("Shipping");

  collectionIndex(context.collections.FlatRateFulfillmentRestrictions, { methodIds: 1 });

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(context.collections.Shipping, { name: 1 }, { name: "c2_name" });
  collectionIndex(context.collections.Shipping, { shopId: 1 }, { name: "c2_shopId" });
}
