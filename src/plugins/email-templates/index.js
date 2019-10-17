import mutations from "./mutations/index.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Email Templates",
    name: "reaction-email-templates",
    functionsByType: {
      startup: [startup]
    },
    mutations
  });
}
