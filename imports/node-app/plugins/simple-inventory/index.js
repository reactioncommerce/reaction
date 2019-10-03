import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import inventoryForProductConfigurations from "./utils/inventoryForProductConfigurations.js";
import createDataLoaders from "./utils/createDataLoaders.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  /**
   * Simple Inventory plugin
   * Isolates the get/set of inventory data to this plugin.
   */
  await app.registerPlugin({
    label: "Simple Inventory",
    name: "reaction-simple-inventory",
    i18n,
    collections: {
      SimpleInventory: {
        name: "SimpleInventory",
        indexes: [
          [{ "productConfiguration.productVariantId": 1, "shopId": 1 }, { unique: true }],
          // Use _id as second sort to force full stability
          [{ updatedAt: 1, _id: 1 }]
        ]
      }
    },
    functionsByType: {
      inventoryForProductConfigurations: [inventoryForProductConfigurations],
      startup: [startup],
      createDataLoaders: [createDataLoaders]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries
  });
}
