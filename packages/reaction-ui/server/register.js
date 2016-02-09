ReactionCore.registerPackage({
  label: "UI",
  name: "reaction-ui",
  icon: "fa fa-html5",
  autoEnable: true,
  settings: {

  },
  registry: [
    {
      provides: "dashboard",
      container: "dashboard",
      route: "dashboard/ui",
      label: "UI",
      description: "Themes and UI Components",
      icon: "fa fa-html5",
      cycle: 1,
      group: "core",
      template: "uiDashboard",
      permissions: [{
        label: "Reaction UI",
        permission: "dashboard/ui"
      }]
    },
    {
      label: "Layout Settings",
      route: "dashboard/ui/settings",
      provides: "settings",
      container: "dashboard",
      template: "reactionUISettings"
    }
  ],
  permissions: [
    {
      label: "Reaction Layout",
      permission: "dashboard/layout",
      group: "Reaction Layout"
    }
  ]
});
