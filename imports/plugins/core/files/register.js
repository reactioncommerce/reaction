import Reaction from "/imports/plugins/core/core/server/Reaction";
import xformFileCollectionsProductMedia from "./server/no-meteor/xforms/xformFileCollectionsProductMedia";

Reaction.registerPackage({
  label: "File Collections",
  name: "reaction-file-collections",
  icon: "fa fa-files-o",
  autoEnable: true,
  collections: {
    MediaRecords: {
      name: "MediaRecords",
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
  settings: {
    name: "File Collections"
  },
  functionsByType: {
    xformCatalogProductMedia: [xformFileCollectionsProductMedia]
  }
});
