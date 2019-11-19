import queries from "./queries/index.js";
import mutations from "./mutations/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import { EmailTemplates } from "./simpleSchemas.js";
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
    version: "1.0.0",
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    mutations,
    simpleSchemas: {
      EmailTemplates
    },
    functionsByType: {
      startup: [startup]
    }
  });
}
