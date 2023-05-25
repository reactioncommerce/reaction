import pkg from "../package.json" assert { type: "json" };
import { sequenceConfigs, registerPluginHandlerForSequences } from "./registration.js";
import startupSequences from "./startup.js";
import mutations from "./mutations/index.js";


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "api-plugin-sequences",
    name: "sequences",
    version: pkg.version,
    collections: {
      Sequences: {
        name: "Sequences",
        indexes: [[{ shopId: 1, entity: 1 }, { unique: true }]]
      }
    },
    contextAdditions: {
      sequenceConfigs
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForSequences],
      startup: [startupSequences]
    },
    mutations
  });
}
