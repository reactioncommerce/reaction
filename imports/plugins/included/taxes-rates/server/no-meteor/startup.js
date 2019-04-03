import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Taxes } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Taxes, { country: 1 }, { name: "c2_country" });
  collectionIndex(Taxes, { postal: 1 }, { name: "c2_postal" });
  collectionIndex(Taxes, { region: 1 }, { name: "c2_region" });
  collectionIndex(Taxes, { shopId: 1 }, { name: "c2_shopId" });
  collectionIndex(Taxes, { taxCode: 1 }, { name: "c2_taxCode" });
}
