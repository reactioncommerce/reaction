import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import shopCreateListener from "./startup/shopCreateListener.js";
import { NavigationItem, NavigationItemContent, NavigationItemData } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Navigation",
    name: "reaction-navigation",
    i18n,
    collections: {
      NavigationItems: {
        name: "NavigationItems"
      },
      NavigationTrees: {
        name: "NavigationTrees"
      }
    },
    functionsByType: {
      startup: [shopCreateListener]
    },
    graphQL: {
      schemas,
      resolvers
    },
    mutations,
    queries,
    shopSettingsConfig: {
      shouldNavigationTreeItemsBePubliclyVisible: {
        defaultValue: false,
        rolesThatCanEdit: ["admin"],
        simpleSchema: {
          type: Boolean
        }
      },
      shouldNavigationTreeItemsBeAdminOnly: {
        defaultValue: false,
        rolesThatCanEdit: ["admin"],
        simpleSchema: {
          type: Boolean
        }
      },
      shouldNavigationTreeItemsBeSecondaryNavOnly: {
        defaultValue: false,
        rolesThatCanEdit: ["admin"],
        simpleSchema: {
          type: Boolean
        }
      }
    },
    simpleSchemas: {
      NavigationItem,
      NavigationItemContent,
      NavigationItemData
    }
  });
}
