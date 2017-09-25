import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Templates",
  name: "reaction-templates",
  icon: "fa fa-columns",
  autoEnable: true,
  settings: {
    name: "Templates",
    custom: {
      enabled: true
    }
  },
  registry: [
    {
      provides: ["dashboard"],
      workflow: "coreDashboardWorkflow",
      name: "Templates",
      label: "Templates",
      description: "App Templates",
      icon: "fa fa-columns",
      priority: 1,
      container: "appearance"
    },
    {
      label: "Template Settings",
      icon: "fa fa-columns",
      name: "templates/settings",
      provides: ["settings"],
      template: "templateSettings",
      meta: {
        actionView: {
          dashboardSize: "md"
        }
      }
    },
    {
      label: "Email Templates",
      name: "templates/settings/email",
      provides: ["templateSettings"],
      template: "emailTemplates"
    }
  ]
});
