import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { collections } = context;
  const { Translations } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Translations, { shopId: 1, i18n: 1 });
}

