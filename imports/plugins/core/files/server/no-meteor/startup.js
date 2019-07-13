import Logger from "@reactioncommerce/logger";
import setUpFileCollections from "./setUpFileCollections";
import convertRemoteImages from "./jobs/convertRemoteImages";
import convertTempImages from "./jobs/convertTempImages";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.app The ReactionNodeApp instance
 * @param {Object} context.collections A map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { app, collections, rootUrl } = context;
  const { MediaRecords } = collections;

  const {
    downloadManager,
    Media,
    remoteUrlWorker,
    fileWorker,
    tempStore
  } = setUpFileCollections({
    absoluteUrlPrefix: rootUrl,
    db: app.db,
    Logger,
    MediaRecords,
    mongodb: app.mongodb
  });

  convertRemoteImages(remoteUrlWorker);
  convertTempImages(fileWorker);

  // Make the Media collection available to resolvers
  collections.Media = Media;

  // Wire up a file download route
  if (app.expressApp) {
    app.expressApp.use("/assets/files", downloadManager.connectHandler);
    app.expressApp.use("/assets/uploads", tempStore.connectHandler);
  }
}
