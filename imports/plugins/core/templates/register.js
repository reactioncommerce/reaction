import Reaction from "/imports/plugins/core/core/server/Reaction";

Reaction.registerPackage({
  label: "Templates",
  name: "reaction-templates",
  icon: "fa fa-columns",
  autoEnable: true,
  collections: {
    Templates: {
      name: "Templates",
      indexes: [
        // Create indexes. We set specific names for backwards compatibility
        // with indexes created by the aldeed:schema-index Meteor package.
        [{ shopId: 1 }, { name: "c2_shopId" }]
      ]
    }
  },
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
