import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Reaction Connect",
  name: "reaction-connect",
  icon: "fa fa-rocket",
  autoEnable: true,
  settings: {
    name: "Connect"
  },
  registry: [
    {
      provides: "dashboard",
      label: "Connect",
      name: "reaction-connect",
      route: "/dashboard/connect",
      description: "Connect Reaction as a deployed service",
      icon: "fa fa-rocket",
      priority: 1,
      container: "utilities"
    },
    {
      provides: "settings",
      route: "/dashboard/connect/settings",
      name: "reaction-connect/settings",
      label: "Reaction Connect",
      icon: "fa fa-rocket",
      container: "reaction-connect",
      template: "connectSettings"
    }
  ]
});
