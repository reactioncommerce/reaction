ReactionCore.registerPackage({
  label: "Layout",
  name: "reaction-layout",
  icon: "fa fa-css3",
  autoEnable: true,
  registry: [
    {
      provides: "dashboard",
      route: "dashboard/layout",
      label: "Layout",
      description: "Theme and layout manager",
      icon: "fa fa-css3",
      cycle: 2,
      group: "reaction-core",
      template: "coreLayoutManager"
    }
  ]
});
