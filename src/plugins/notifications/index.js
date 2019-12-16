import mutations from "./mutations/index.js";
import startup from "./startup.js";
import { Notification } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Notifications",
    name: "reaction-notification",
    version: app.context.appVersion,
    collections: {
      Notifications: {
        name: "Notifications"
      }
    },
    functionsByType: {
      startup: [startup]
    },
    mutations,
    simpleSchemas: {
      Notification
    }
  });
}
