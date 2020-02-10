import { getHasPermissionFunctionForUser } from "./util/hasPermission.js";
import permissionsByUserId from "./util/permissionsByUserId.js";
import preStartup from "./preStartup.js";


/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Simple Authorization",
    name: "simple-authorization",
    version: "1.0.0",
    collections: {
      roles: {
        name: "roles"
      }
    },
    auth: {
      permissionsByUserId
    },
    functionsByType: {
      getHasPermissionFunctionForUser: [getHasPermissionFunctionForUser],
      preStartup: [preStartup]
    }
  });
}
