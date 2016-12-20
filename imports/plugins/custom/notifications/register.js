import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Notifications",
  name: "reaction-notification",
  icon: "fa fa-bell",
  autoEnable: true,
  registry: [{
    label: "Notifications",
    name: "Notifications",
    route: "/notifications",
    permissions: [{
      permission: "account/profile"
    }],
    template: "notificationRoute"
  }]
});
