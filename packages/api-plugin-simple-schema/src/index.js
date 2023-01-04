import pkg from "../package.json" assert { type: "json" };
import { registerPluginHandlerForSimpleSchema, simpleSchemas } from "./registration.js";

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
      registerPluginHandler: [registerPluginHandlerForSimpleSchema]
    },
    contextAdditions: {
      simpleSchemas
    }
  });
}
