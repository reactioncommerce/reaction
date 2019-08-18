import xformFileCollectionsProductMedia from "./xforms/xformFileCollectionsProductMedia";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "File Collections",
    name: "reaction-file-collections",
    icon: "fa fa-files-o",
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
    }
  });
}
