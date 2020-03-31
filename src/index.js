import pkg from "../package.json";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Simple Pricing",
    name: "simple-pricing",
    version: pkg.version
  });
}
