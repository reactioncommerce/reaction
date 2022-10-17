import { createRequire } from "module";
import { promotions, registerPluginHandlerForPromotions } from "./registration.js";
import mutations from "./mutations/index.js";
import startupPromotions from "./startup.js";
import preStartupPromotions from "./preStartup.js";
import { Promotion } from "./simpleSchemas.js";
import actions from "./actions/index.js";
import qualifiers from "./qualifiers/index.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: pkg.label,
    name: pkg.name,
    version: pkg.version,
    collections: {
      Promotions: {
        name: "Promotions"
      }
    },
    simpleSchemas: {
      Promotion
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForPromotions],
      preStartup: [preStartupPromotions],
      startup: [startupPromotions]
    },
    contextAdditions: {
      promotions
    },
    promotions: {
      actions,
      qualifiers
    },
    mutations
  });
}
