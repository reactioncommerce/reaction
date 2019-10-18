import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import updateSitemapTaskForShop from "./jobs/updateSitemapTaskForShop.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Sitemap Generator",
    name: "reaction-sitemap-generator",
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
    mutations,
    shopSettingsConfig: {
      sitemapRefreshPeriod: {
        afterUpdate(context, { shopId }) {
          updateSitemapTaskForShop(context, shopId);
        },
        defaultValue: "every 24 hours",
        rolesThatCanEdit: ["admin"],
        simpleSchema: {
          type: String
        }
      }
    }
  });
}
