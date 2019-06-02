import Reaction from "/imports/plugins/core/core/server/Reaction";
import resolvers from "./server/no-meteor/resolvers";
import schemas from "./server/no-meteor/schemas";

Reaction.registerPackage({
  label: "Product",
  name: "reaction-product",
  autoEnable: true,
  collections: {
    Products: {
      name: "Products",
      indexes: [
        // Create indexes. We set specific names for backwards compatibility
        // with indexes created by the aldeed:schema-index Meteor package.
        [{ ancestors: 1 }, { name: "c2_ancestors" }],
        [{ createdAt: 1 }, { name: "c2_createdAt" }],
        [{ handle: 1 }, { name: "c2_handle" }],
        [{ hashtags: 1 }, { name: "c2_hashtags" }],
        [{ shopId: 1 }, { name: "c2_shopId" }],
        [{ "workflow.status": 1 }, { name: "c2_workflow.status" }]
      ]
    }
  },
  graphQL: {
    resolvers,
    schemas
  }
});
