import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import queries from "./queries/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json" assert { type: "json" };
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import updateSitemapTaskForShop from "./jobs/updateSitemapTaskForShop.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Sitemap Generator",
    name: "sitemap-generator",
    version: pkg.version,
    i18n,
    collections: {
      Sitemaps: {
        name: "Sitemaps",
        indexes: [
          [{ shopId: 1, handle: 1 }]
        ]
      }
    },
    functionsByType: {
      startup: [startup]
    },
    backgroundJobs: {
      cleanup: [
        { type: "sitemaps/generate", purgeAfterDays: 3 }
      ]
    },
    graphQL: {
      resolvers,
      schemas
    },
    queries,
    mutations,
    policies,
    shopSettingsConfig: {
      sitemapRefreshPeriod: {
        afterUpdate(context, { shopId }) {
          updateSitemapTaskForShop(context, shopId);
        },
        defaultValue: "every 24 hours",
        permissionsThatCanEdit: ["reaction:legacy:sitemaps/update:settings"],
        simpleSchema: {
          type: String
        }
      }
    }
  });
}
