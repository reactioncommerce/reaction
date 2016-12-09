import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Shippo",
  name: "reaction-shippo",
  icon: "fa fa-at",
  autoEnable: true,
  settings: {
    api_key: ""
  },
  registry: [{
    provides: "dashboard",
    label: "Shippo",
    description: "Shippo service",
    icon: "fa fa-at",
    priority: 3,
    container: "connect",
    permissions: [{
      label: "Shippo",
      permission: "dashboard/shippo"
    }]
  }, {
    label: "Shippo",
    route: "/dashboard/shippo",
    provides: "settings",
    container: "connection",
    template: "shippoSettings"
  }
  ]
});
