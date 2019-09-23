import i18n from "./i18n";
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
    label: "Sitemap Generator",
    name: "reaction-sitemap-generator",
    icon: "fa fa-vine",
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
    graphQL: {
      resolvers,
      schemas
    },
    mutations
  });
}
