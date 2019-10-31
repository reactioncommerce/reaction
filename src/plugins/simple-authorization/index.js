import { getHasPermissionFunctionForUserLegacy } from "./util/hasPermission.js";
import { getShopsUserHasPermissionForFunctionForUserLegacy } from "./util/shopsUserHasPermissionForLegacy.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Simple Authorization",
    name: "reaction-simple-authorization",
    auth: {
      getHasPermissionFunctionForUserLegacy,
      getShopsUserHasPermissionForFunctionForUserLegacy
    }
  });
}
