ReactionCore.registerPackage({
  label: "Layout",
  name: "reaction-layout",
  icon: "fa fa-css3",
  autoEnable: true,
  settings: {

  },
  registry: [
    {
      provides: "dashboard",
      container: "dashboard",
      route: "dashboard/layout",
      label: "Layout",
      description: "Theme and layout manager",
      icon: "fa fa-css3",
      cycle: 1,
      group: "core",
      template: "layoutDashboard",
      permissions: [{
        label: "Reaction Layout",
        permission: "dashboard/layout"
      }]
    },
    {
      label: "Layout Settings",
      route: "dashboard/layout/settings",
      provides: "settings",
      container: "dashboard",
      template: "reactionLayoutSettings"
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
