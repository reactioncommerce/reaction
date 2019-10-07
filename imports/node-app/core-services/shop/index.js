import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import createDataLoaders from "./utils/createDataLoaders.js";
import { Shop } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Shop",
    name: "reaction-shop",
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    mutations,
    functionsByType: {
      createDataLoaders: [createDataLoaders]
    },
    simpleSchemas: {
      Shop
    }
  });
}
