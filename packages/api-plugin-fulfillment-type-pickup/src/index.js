import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";

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
    i18n,
    graphQL: {
      schemas
    },
    functionsByType: {
      startup: [startup]
    },
    registeredFulfillmentTypes: ["pickup"]
  });
}
