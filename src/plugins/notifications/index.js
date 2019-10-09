import mutations from "./mutations/index.js";
import startup from "./startup.js";
import { Notification } from "./simpleSchemas.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Notifications",
    name: "reaction-notification",
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
    },
    registry: [{
      label: "Notifications",
      name: "notifications",
      route: "/notifications",
      workflow: "coreWorkflow",
      permissions: [{
        label: "Notifications",
        permission: "notifications"
      }],
      template: "notificationRoute"
    }]
  });
}
