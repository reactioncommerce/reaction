import pkg from "../package.json";
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import afterShopCreate from "./startup/afterShopCreate.js";
import extendAccountSchema from "./preStartup/extendAccountSchema.js";
import checkDatabaseVersion from "./preStartup/checkDatabaseVersion.js";
import accountByUserId from "./util/accountByUserId.js";
import { Account, Group } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Accounts",
    name: "accounts",
    version: pkg.version,
    i18n,
    functionsByType: {
      preStartup: [extendAccountSchema, checkDatabaseVersion],
      startup: [afterShopCreate]
    },
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
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    policies,
    simpleSchemas: {
      Account,
      Group
    }
  });
}
