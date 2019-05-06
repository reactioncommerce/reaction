import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Packages, Shops } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Packages, { name: 1, shopId: 1 });
  collectionIndex(Packages, { "registry.provides": 1 }, { name: "c2_registry.$.provides" });

  collectionIndex(Shops, { domains: 1 }, { name: "c2_domains" });
  collectionIndex(Shops, { name: 1 }, { name: "c2_name" });
  collectionIndex(Shops, { slug: 1 }, { name: "c2_slug", sparse: true, unique: true });
}
