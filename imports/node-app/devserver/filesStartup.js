import Logger from "@reactioncommerce/logger";
import setUpFileCollections from "/imports/plugins/core/files/server/no-meteor/setUpFileCollections";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.app The ReactionNodeApp instance
 * @param {Object} context.collections A map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ app, collections, rootUrl }) {
  const { downloadManager, Media } = setUpFileCollections({
    absoluteUrlPrefix: rootUrl,
    db: app.db,
    Logger,
    MediaRecords: collections.MediaRecords,
    mongodb: app.mongodb
  });

  // Make the Media collection available to resolvers
  collections.Media = Media;

  // Wire up a file download route
  app.expressApp.use("/assets/files", downloadManager.connectHandler);
}
