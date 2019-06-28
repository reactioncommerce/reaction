import resolvers from "./resolvers";
import schemas from "./schemas";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
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
}
