import xformFileCollectionsProductMedia from "./xforms/xformFileCollectionsProductMedia.js";
import mutations from "./mutations/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "File Collections",
    name: "reaction-file-collections",
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
      startup: [startup],
      xformCatalogProductMedia: [xformFileCollectionsProductMedia]
    },
    mutations,
    graphQL: {
      resolvers,
      schemas
    },
    backgroundJobs: {
      cleanup: [
        { type: "saveImage/local", purgeAfterDays: 7 },
        { type: "saveImage/remote", purgeAfterDays: 7 }
      ]
    },
    registry: [
      {
        route: "media/create",
        label: "Create Media",
        permission: "mediaCreate",
        name: "media/create"
      },
      {
        route: "media/update",
        label: "Update Media",
        permission: "mediaUpdate",
        name: "media/update"
      },
      {
        route: "media/delete",
        label: "Delete Media",
        permission: "mediaDelete",
        name: "media/delete"
      }
    ]
  });
}
