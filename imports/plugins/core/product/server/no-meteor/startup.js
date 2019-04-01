import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Products } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Products, { ancestors: 1 }, { name: "c2_ancestors" });
  collectionIndex(Products, { createdAt: 1 }, { name: "c2_createdAt" });
  collectionIndex(Products, { handle: 1 }, { name: "c2_handle" });
  collectionIndex(Products, { hashtags: 1 }, { name: "c2_hashtags" });
  collectionIndex(Products, { isDeleted: 1 }, { name: "c2_isDeleted" });
  collectionIndex(Products, { isVisible: 1 }, { name: "c2_isVisible" });
  collectionIndex(Products, { shopId: 1 }, { name: "c2_shopId" });
  collectionIndex(Products, { "workflow.status": 1 }, { name: "c2_workflow.status" });
}
