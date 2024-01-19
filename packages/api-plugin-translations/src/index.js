import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Translations",
    name: "plugin-translations",
    version: pkg.version,
    i18n
  });
}
