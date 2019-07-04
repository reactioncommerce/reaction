import Logger from "@reactioncommerce/logger";
import setUpFileCollections from "./setUpFileCollections";

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
    stores,
    tempStore
  } = setUpFileCollections({
    absoluteUrlPrefix: rootUrl,
    db: app.db,
    Logger,
    MediaRecords,
    mongodb: app.mongodb
  });

  // This isn't probably the best solution, but for now this is how
  // we'll make these things available to the Meteor code that does
  // the rest of the files configuration.
  context.files = {
    stores,
    tempStore
  };

  // Make the Media collection available to resolvers
  collections.Media = Media;

  // Wire up a file download route
  if (app.expressApp) {
    app.expressApp.use("/assets/files", downloadManager.connectHandler);
  }
}
