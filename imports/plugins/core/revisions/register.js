import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "Revisions",
  name: "reaction-revisions",
  autoEnable: true,
  settings: {
    general: {
      enabled: true
    }
  },
  registry: [
    // Dashboard card
    {
      provides: "dashboard",
      label: "Revisions",
      description: "Revision control",
      icon: "fa fa-undo",
      priority: 2,
      container: "core"
    },
    // Settings Panel
    {
      label: "Revision Settings",
      route: "/dashboard/revisions",
      provides: "settings",
      container: "dashboard",
      template: "revisionControlSettings"
    }
  ]
});
