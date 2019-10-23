import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import { registerPluginHandler } from "./registration.js";
import { Cart, CartItem } from "./simpleSchemas.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Cart",
    name: "reaction-cart",
    collections: {
      Cart: {
        name: "Cart",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ accountId: 1 }, { name: "c2_accountId" }],
          [{ accountId: 1, shopId: 1 }],
          [{ anonymousAccessToken: 1 }, { name: "c2_anonymousAccessToken" }],
          [{
            referenceId: 1
          }, {
            unique: true,
            // referenceId is an optional field for carts, so we want the uniqueness constraint
            // to apply only to non-null fields or the second document with value `null`
            // would throw an error.
            partialFilterExpression: {
              referenceId: {
                $type: "string"
              }
            }
          }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ "items.productId": 1 }, { name: "c2_items.$.productId" }],
          [{ "items.variantId": 1 }, { name: "c2_items.$.variantId" }]
        ]
      }
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandler],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    simpleSchemas: {
      Cart,
      CartItem
    }
  });
}
