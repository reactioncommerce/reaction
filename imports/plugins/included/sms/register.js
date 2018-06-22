import Reaction from "/server/api/core";

Reaction.registerPackage({
  label: "SMS",
  name: "reaction-sms",
  icon: "fa fa-mobile",
  autoEnable: true,
  settings: {
    name: "SMS"
  },
  registry: [{
    provides: ["dashboard"],
    label: "SMS",
    description: "Notifications",
    icon: "fa fa-mobile fa-2x",
    priority: 3,
    container: "core",
    workflow: "coreDashboardWorkflow"
  }, {
    label: "SMS Settings",
    icon: "fa fa-mobile",
    route: "/dashboard/sms",
    provides: ["settings"],
    container: "dashboard",
    template: "SmsSettings",
    showForShopTypes: ["primary"]
  }]
});
