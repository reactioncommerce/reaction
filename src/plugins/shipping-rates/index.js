import i18n from "./i18n/index.js";
import getFulfillmentMethodsWithQuotes from "./getFulfillmentMethodsWithQuotes.js";
import resolvers from "./resolvers/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Shipping Rates",
    name: "reaction-shipping-rates",
    version: app.context.appVersion,
    i18n,
    collections: {
      FlatRateFulfillmentRestrictions: {
        name: "FlatRateFulfillmentRestrictions",
        indexes: [
          [{ methodIds: 1 }]
        ]
      },
      Shipping: {
        name: "Shipping",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ name: 1 }, { name: "c2_name" }],
          [{ shopId: 1 }, { name: "c2_shopId" }]
        ]
      }
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    functionsByType: {
      getFulfillmentMethodsWithQuotes: [getFulfillmentMethodsWithQuotes]
    }
  });
}
