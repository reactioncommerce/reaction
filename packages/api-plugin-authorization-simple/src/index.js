import pkg from "../package.json" assert { type: "json" };
import { getHasPermissionFunctionForUser } from "./util/hasPermission.js";
import permissionsByUserId from "./util/permissionsByUserId.js";
import preStartup from "./preStartup.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Simple Authorization",
    name: "authorization-simple",
    version: pkg.version,
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
      preStartup: [preStartup],
      startup: [startup]
    },
    queries,
    graphQL: {
      resolvers,
      schemas
    }
  });
}
