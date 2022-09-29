import { createRequire } from "module";
import preStartupOffers from "./preStartup.js";
import handlers from "./handlers/index.js";
import actions from "./actions/index.js";
import enhancers from "./enhancers/index.js";

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
    functionsByType: {
      preStartup: [preStartupOffers]
    },
    promotions: {
      triggers: ["offers"],
      schemaExtensions: [],
      triggerHandlers: handlers,
      actionHandlers: actions,
      enhancers
    }
  });
}
