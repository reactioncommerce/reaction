import pkg from "../package.json" assert { type: "json" };
import getSurcharges from "./getSurcharges.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json" assert { type: "json" };
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import setSurchargesOnCart from "./util/setSurchargesOnCart.js";
import {
  AppliedSurcharge,
  Surcharge,
  SurchargeMessagesByLanguage
} from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Surcharges",
    name: "surcharges",
    version: pkg.version,
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
    policies,
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
    },
    simpleSchemas: {
      AppliedSurcharge,
      Surcharge,
      SurchargeMessagesByLanguage
    }
  });
}
