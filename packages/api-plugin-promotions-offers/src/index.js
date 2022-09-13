import { createRequire } from "module";
import registerCartHandlers from "./handlers/registerCarthandlers.js";
import preStartupOffers from "./startup/preStartup.js";

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
      preStartup: [preStartupOffers],
      startup: [registerCartHandlers]
    },
    promotions: {
      triggers: ["offers"],
      schemaExtensions: []
    }
  });
}
