import pkg from "../package.json";
import queries from "./queries/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
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
    name: "email-templates",
    version: pkg.version,
    graphQL: {
      resolvers,
      schemas
    },
    policies,
    queries,
    mutations,
    simpleSchemas: {
      EmailTemplates
    },
    functionsByType: {
      startup: [startup]
    },
    collections: {
      Templates: {
        name: "Templates",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ shopId: 1 }, { name: "c2_shopId" }]
        ]
      }
    }
  });
}
