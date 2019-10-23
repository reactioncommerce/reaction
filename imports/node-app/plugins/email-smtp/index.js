import mutations from "./mutations/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "SMTP Email",
    name: "reaction-email-smtp",
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
