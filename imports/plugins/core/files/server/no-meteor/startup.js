import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { MediaRecords } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(MediaRecords, { "metadata.productId": 1 });
  collectionIndex(MediaRecords, { "metadata.variantId": 1 });
  collectionIndex(MediaRecords, { "metadata.priority": 1 });

  // These queries are used by the workers in file-collections package
  collectionIndex(MediaRecords, { "original.remoteURL": 1 });
  collectionIndex(MediaRecords, { "original.tempStoreId": 1 });
}
