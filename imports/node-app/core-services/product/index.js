import mutations from "./mutations/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import {
  Product,
  ProductVariant,
  VariantMedia
} from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Product",
    name: "reaction-product",
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
          [{ "workflow.status": 1 }, { name: "c2_workflow.status" }],
          // Use _id as second sort to force full stability
          [{ updatedAt: 1, _id: 1 }]
        ]
      }
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    simpleSchemas: {
      Product,
      ProductVariant,
      VariantMedia
    }
  });
}
