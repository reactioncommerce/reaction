import pkg from "../package.json" assert { type: "json" };
import mutations from "./mutations/index.js";
import policies from "./policies.json" assert { type: "json" };
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import createDataLoaders from "./utils/createDataLoaders.js";
import { Shop } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Shops",
    name: "shops",
    version: pkg.version,
    collections: {
      Shops: {
        name: "Shops",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ domains: 1 }, { name: "c2_domains" }],
          [{ name: 1 }, { name: "c2_name" }],
          [{ slug: 1 }, { name: "c2_slug", sparse: true, unique: true }]
        ]
      }
    },
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    mutations,
    policies,
    functionsByType: {
      createDataLoaders: [createDataLoaders]
    },
    simpleSchemas: {
      Shop
    }
  });
}
