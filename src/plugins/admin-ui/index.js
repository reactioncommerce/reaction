import schemas from "./schemas/index.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Admin UI",
    name: "admin-ui",
    version: app.context.appVersion,
    graphQL: {
      schemas
    },
    globalSettingsConfig: {
      canSeeAdminUI: {
        defaultValue: false,
        permissionsThatCanEdit: ["reaction:legacy:shops/update"],
        simpleSchema: {
          type: Boolean
        }
      }
    }
  });
}
