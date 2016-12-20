import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Sms",
  name: "reaction-sms",
  icon: "fa fa-mobile",
  autoEnable: false,
  registry: [{
    provides: "dashboard",
    label: "Sms",
    description: "Notifications",
    icon: "fa fa-mobile fa-2x",
    priority: 3,
    container: "utilities"
  }, {
    label: "Sms Settings",
    route: "/dashboard/sms",
    provides: "settings",
    container: "dashboard",
    template: "smsSettings"
  }]
});
