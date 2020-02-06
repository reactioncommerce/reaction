import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import accountByUserId from "./util/accountByUserId.js";
import { Account } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Accounts",
    name: "reaction-accounts",
    version: app.context.appVersion,
    i18n,
    collections: {
      Accounts: {
        name: "Accounts",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ groups: 1 }, { name: "c2_groups" }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ userId: 1 }, { name: "c2_userId" }],
          [{ shopId: 1, slug: 1 }]
        ]
      },
      AccountInvites: {
        name: "AccountInvites",
        indexes: [
          [{ email: 1 }]
        ]
      },
      Groups: {
        name: "Groups"
      }
    },
    auth: {
      accountByUserId
    },
    functionsByType: {
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    policies,
    simpleSchemas: {
      Account
    }
  });
}
