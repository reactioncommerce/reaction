import pkg from "../package.json";
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Shipments",
    name: "shipments",
    version: pkg.version,
    i18n,
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    mutations
  });
}
