import pkg from "../package.json" assert { type: "json" };
import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import policies from "./policies.json" assert { type: "json" };
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import shopCreateListener from "./startup/shopCreateListener.js";
import { NavigationItem, NavigationItemContent, NavigationItemData } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Navigation",
    name: "navigation",
    version: pkg.version,
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
    policies,
    queries,
    shopSettingsConfig: {
      shouldNavigationTreeItemsBePubliclyVisible: {
        defaultValue: false,
        permissionsThatCanEdit: ["reaction:legacy:navigationTreeItems/update:settings"],
        simpleSchema: {
          type: Boolean
        }
      },
      shouldNavigationTreeItemsBeAdminOnly: {
        defaultValue: false,
        permissionsThatCanEdit: ["reaction:legacy:navigationTreeItems/update:settings"],
        simpleSchema: {
          type: Boolean
        }
      },
      shouldNavigationTreeItemsBeSecondaryNavOnly: {
        defaultValue: false,
        permissionsThatCanEdit: ["reaction:legacy:navigationTreeItems/update:settings"],
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
