import { getHasPermissionFunctionForUser } from "./util/hasPermission.js";
import permissionsByUserId from "./util/permissionsByUserId.js";


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Legacy Authorization",
    name: "reaction-legacy-authorization",
    version: app.context.appVersion,
    collections: {
      roles: {
        name: "roles"
      }
    },
    auth: {
      permissionsByUserId
    },
    functionsByType: {
      getHasPermissionFunctionForUser: [getHasPermissionFunctionForUser]
    }
  });
}
