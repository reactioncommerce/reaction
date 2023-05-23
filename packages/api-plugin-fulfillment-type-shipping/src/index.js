import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";


const { name, version } = pkg;
export const logCtx = {
  name,
  version,
  file: "src/index.js"
};

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {Object} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Fulfillment Type Shipping",
    name: "fulfillment-type-shipping",
    version: pkg.version,
    i18n,
    graphQL: {
      schemas
    },
    functionsByType: {
      startup: [startup]
    },
    registeredFulfillmentTypes: ["shipping"]
  });
}
