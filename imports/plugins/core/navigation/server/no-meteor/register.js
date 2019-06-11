import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Navigation",
    name: "reaction-navigation",
    autoEnable: true,
    collections: {
      NavigationItems: {
        name: "NavigationItems"
      },
      NavigationTrees: {
        name: "NavigationTrees"
      }
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
    }
  });
}
