import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import startup from "./startup.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Email",
    name: "reaction-email",
    version: app.context.appVersion,
    i18n,
    collections: {
      Emails: {
        name: "Emails",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ jobId: 1 }, { name: "c2_jobId" }]
        ]
      }
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    functionsByType: {
      startup: [startup]
    }
  });
}
