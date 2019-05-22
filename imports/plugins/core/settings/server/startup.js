import collectionIndex from "/imports/utils/collectionIndex";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { app, collections } = context;

  const AppSettings = app.db.collection("AppSettings");
  collections.AppSettings = AppSettings;

  collectionIndex(AppSettings, { shopId: 1 }, { unique: true });
}
