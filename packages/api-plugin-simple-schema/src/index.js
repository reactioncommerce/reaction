import pkg from "../package.json" assert { type: "json" };
import { registerPluginHandlerForSimpleSchema, simpleSchemas } from "./registration.js";
import schemas from "./schemas/index.js";
import resolvers from "./resolvers/index.js";
import queries from "./queries/index.js";
import preStartup from "./preStartup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Simple Schema",
    name: "simple-schema",
    version: pkg.version,
    functionsByType: {
      preStartup: [preStartup],
      registerPluginHandler: [registerPluginHandlerForSimpleSchema]
    },
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    contextAdditions: {
      simpleSchemas
    }
  });
}
