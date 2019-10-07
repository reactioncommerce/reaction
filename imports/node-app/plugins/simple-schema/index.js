import { registerPluginHandler, simpleSchemas } from "./registration.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "SimpleSchema",
    name: "reaction-simple-schema",
    functionsByType: {
      registerPluginHandler: [registerPluginHandler]
    },
    contextAdditions: {
      simpleSchemas
    }
  });
}
