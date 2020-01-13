import { registerPluginHandlerForSimpleSchema, simpleSchemas } from "./registration.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "SimpleSchema",
    name: "reaction-simple-schema",
    version: app.context.appVersion,
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForSimpleSchema]
    },
    contextAdditions: {
      simpleSchemas
    }
  });
}
