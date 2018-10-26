import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "Taxes",
  name: "reaction-taxes",
  icon: "fa fa-university",
  autoEnable: true,
  functionsByType: {
    startup: [startup]
  },
  registry: [
    {
      provides: ["dashboard"],
      name: "taxes",
      label: "Taxes",
      description: "Provide tax rates",
      icon: "fa fa-university",
      priority: 1,
      container: "core",
      workflow: "coreDashboardWorkflow"
    },
    {
      label: "Tax Settings",
      icon: "fa fa-university",
      name: "taxes/settings",
      provides: ["settings"],
      template: "taxSettings"
    }
  ]
});
