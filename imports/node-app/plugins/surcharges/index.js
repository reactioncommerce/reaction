import getSurcharges from "./getSurcharges.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import setSurchargesOnCart from "./util/setSurchargesOnCart.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Surcharges",
    name: "reaction-surcharges",
    collections: {
      Surcharges: {
        name: "Surcharges",
        indexes: [
          [{ shopId: 1 }]
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
      getSurcharges: [getSurcharges]
    },
    cart: {
      transforms: [
        {
          name: "setSurchargesOnCart",
          fn: setSurchargesOnCart,
          priority: 20
        }
      ]
    }
  });
}
