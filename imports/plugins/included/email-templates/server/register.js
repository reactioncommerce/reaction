import mutations from "./mutations";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Email Templates",
    name: "reaction-email-templates",
    icon: "fa fa-envelope-o",
    functionsByType: {
      startup: [startup]
    },
    mutations
  });
}
