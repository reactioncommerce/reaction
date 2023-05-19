import pkg from "../package.json";
import schemas from "./schemas/index.js";
import { Location, LocationAddress } from "./simpleSchemas.js";
import resolvers from "./resolvers/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "location",
    name: "location",
    version: pkg.version,
    collections: {
      Locations: {
        name: "Locations",
        indexes: [[{ shopId: 1, enabled: 1 }, { name: "shopId__enabled" }]]
      }
    },
    graphQL: {
      schemas,
      resolvers
    },
    mutations,
    queries,
    simpleSchemas: {
      Location,
      LocationAddress
    }
  });
}
