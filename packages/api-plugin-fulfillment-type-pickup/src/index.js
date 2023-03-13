import { createRequire } from "module";
import schemas from "./schemas/index.js";
import startup from "./startup.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment Type Pickup",
    name: "fulfillment-type-pickup",
    version: pkg.version,
    graphQL: {
      schemas
    },
    functionsByType: {
      startup: [startup]
    },
    registeredFulfillmentTypes: ["pickup"]
  });
}
