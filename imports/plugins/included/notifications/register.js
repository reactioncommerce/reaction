import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Notifications",
  name: "reaction-notification",
  icon: "fa fa-bell",
  autoEnable: true,
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
