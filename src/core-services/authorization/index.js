import { getHasPermissionFunctionForUser } from "./util/hasPermission.js";
import { getShopsUserHasPermissionForFunctionForUser } from "./util/shopsUserHasPermissionFor.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Authorization",
    name: "reaction-authorization",
    auth: {
      getHasPermissionFunctionForUser,
      getShopsUserHasPermissionForFunctionForUser
    }
  });
}
