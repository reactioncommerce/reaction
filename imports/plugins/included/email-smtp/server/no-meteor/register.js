import mutations from "./mutations";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "SMTP Email",
    name: "reaction-email-smtp",
    icon: "fa fa-envelope-o",
    functionsByType: {
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    registry: [
      {
        provides: ["emailProviderConfig"],
        template: "SMTPEmailConfig"
      }
    ]
  });
}
