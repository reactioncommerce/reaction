import mutations from "./mutations/index.js";
import policies from "./policies.json";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import mutateProductHashObjectAddMedia from "./util/mutateProductHashObject.js";
import publishProductToCatalog from "./util/publishProductToCatalog.js";
import xformItemsAddImageUrls from "./util/xformItemsAddImageUrls.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "File Collections",
    name: "reaction-file-collections",
    version: app.context.appVersion,
    collections: {
      MediaRecords: {
        name: "cfs.Media.filerecord",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ "metadata.productId": 1 }],
          [{ "metadata.variantId": 1 }],
          [{ "metadata.priority": 1 }],

          // These queries are used by the workers in file-collections package
          [{ "original.remoteURL": 1 }],
          [{ "original.tempStoreId": 1 }]
        ]
      }
    },
    functionsByType: {
      mutateProductHashObject: [mutateProductHashObjectAddMedia],
      publishProductToCatalog: [publishProductToCatalog],
      startup: [startup],
      xformCartItems: [xformItemsAddImageUrls],
      xformOrderItems: [xformItemsAddImageUrls]
    },
    mutations,
    policies,
    graphQL: {
      resolvers,
      schemas
    },
    backgroundJobs: {
      cleanup: [
        { type: "saveImage/local", purgeAfterDays: 7 },
        { type: "saveImage/remote", purgeAfterDays: 7 }
      ]
    }
  });
}
