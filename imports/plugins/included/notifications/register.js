import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Notifications",
  name: "reaction-notification",
  icon: "fa fa-bell",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
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
